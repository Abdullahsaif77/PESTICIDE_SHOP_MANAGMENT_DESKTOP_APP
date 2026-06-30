const SupplierRepository = require("../repositories/supplier.repository");

class SupplierService {
    async createSupplier(data) {
        try {
            // Validation: Name is required
            if (!data.name || data.name.trim() === '') {
                return { success: false, error: 'Supplier name is required' };
            }

            // Validation: Name minimum length
            if (data.name.trim().length < 2) {
                return { success: false, error: 'Supplier name must be at least 2 characters' };
            }

            // Validation: Phone format (if provided)
            if (data.phone && !this.validatePhone(data.phone)) {
                return { success: false, error: 'Invalid phone number format. Use format: 03XX-XXXXXXX' };
            }

            // Validation: Email format (if provided)
            if (data.email && !this.validateEmail(data.email)) {
                return { success: false, error: 'Invalid email format' };
            }

            // Validation: CNIC format (if provided)
            if (data.cnic && !this.validateCNIC(data.cnic)) {
                return { success: false, error: 'Invalid CNIC format. Use format: XXXXX-XXXXXXX-X' };
            }

            // Validation: CNIC must be unique
            if (data.cnic) {
                const existingByCNIC = await SupplierRepository.getByCNIC(data.cnic);
                if (existingByCNIC) {
                    return { success: false, error: `Supplier with CNIC "${data.cnic}" already exists` };
                }
            }

            // Validation: Phone must be unique
            if (data.phone) {
                const existingByPhone = await SupplierRepository.getByPhone(data.phone);
                if (existingByPhone) {
                    return { success: false, error: `Supplier with phone "${data.phone}" already exists` };
                }
            }

            // Validation: Name must be unique (case-insensitive)
            const existingByName = await SupplierRepository.getByName(data.name.trim());
            if (existingByName) {
                return { success: false, error: `Supplier with name "${data.name}" already exists` };
            }

            // Validation: Credit and Debit cannot be negative
            if (data.credit !== undefined && data.credit < 0) {
                return { success: false, error: 'Credit cannot be negative' };
            }
            if (data.debit !== undefined && data.debit < 0) {
                return { success: false, error: 'Debit cannot be negative' };
            }

            // Create supplier
            const result = await SupplierRepository.create({
                name: data.name.trim(),
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
                cnic: data.cnic || null,
                credit: data.credit || 0,
                debit: data.debit || 0,
                notes: data.notes || null,
                is_active: data.is_active !== undefined ? data.is_active : 1
            });

            if (!result.lastInsertRowid) {
                return { success: false, error: 'Failed to create supplier' };
            }

            const supplier = await SupplierRepository.getById(result.lastInsertRowid);
            return {
                success: true,
                data: supplier,
                message: `Supplier "${data.name}" created successfully`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAllSuppliers(filters = {}) {
        try {
            const suppliers = await SupplierRepository.getAll(filters);
            return {
                success: true,
                data: suppliers,
                count: suppliers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getSupplierById(id) {
        try {
            if (!id) {
                return { success: false, error: 'Supplier ID is required' };
            }

            const supplier = await SupplierRepository.getById(id);
            if (!supplier) {
                return { success: false, error: 'Supplier not found' };
            }

            return { success: true, data: supplier };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateSupplier(id, data) {
        try {
            if (!id) {
                return { success: false, error: 'Supplier ID is required' };
            }

            // Check if supplier exists
            const existing = await SupplierRepository.getById(id);
            if (!existing) {
                return { success: false, error: 'Supplier not found' };
            }

            // Validation: Name (if provided)
            if (data.name !== undefined) {
                if (!data.name || data.name.trim() === '') {
                    return { success: false, error: 'Supplier name cannot be empty' };
                }
                if (data.name.trim().length < 2) {
                    return { success: false, error: 'Supplier name must be at least 2 characters' };
                }

                // Check duplicate name (excluding current)
                const duplicate = await SupplierRepository.getByName(data.name.trim());
                if (duplicate && duplicate.id !== id) {
                    return { success: false, error: `Supplier with name "${data.name}" already exists` };
                }
            }

            // Validation: Phone (if provided)
            if (data.phone !== undefined) {
                if (data.phone && !this.validatePhone(data.phone)) {
                    return { success: false, error: 'Invalid phone number format' };
                }

                // Check duplicate phone (excluding current)
                if (data.phone) {
                    const duplicate = await SupplierRepository.getByPhone(data.phone);
                    if (duplicate && duplicate.id !== id) {
                        return { success: false, error: `Supplier with phone "${data.phone}" already exists` };
                    }
                }
            }

            // Validation: Email (if provided)
            if (data.email !== undefined && data.email && !this.validateEmail(data.email)) {
                return { success: false, error: 'Invalid email format' };
            }

            // Validation: CNIC (if provided)
            if (data.cnic !== undefined) {
                if (data.cnic && !this.validateCNIC(data.cnic)) {
                    return { success: false, error: 'Invalid CNIC format' };
                }

                // Check duplicate CNIC (excluding current)
                if (data.cnic) {
                    const duplicate = await SupplierRepository.getByCNIC(data.cnic);
                    if (duplicate && duplicate.id !== id) {
                        return { success: false, error: `Supplier with CNIC "${data.cnic}" already exists` };
                    }
                }
            }

            // Validation: Credit and Debit cannot be negative
            if (data.credit !== undefined && data.credit < 0) {
                return { success: false, error: 'Credit cannot be negative' };
            }
            if (data.debit !== undefined && data.debit < 0) {
                return { success: false, error: 'Debit cannot be negative' };
            }

            // Update supplier
            const result = await SupplierRepository.update(id, data);
            if (result.changes === 0) {
                return { success: false, error: 'No changes made' };
            }

            const supplier = await SupplierRepository.getById(id);
            return {
                success: true,
                data: supplier,
                message: 'Supplier updated successfully'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteSupplier(id) {
        try {
            if (!id) {
                return { success: false, error: 'Supplier ID is required' };
            }

            const existing = await SupplierRepository.getById(id);
            if (!existing) {
                return { success: false, error: 'Supplier not found' };
            }

            // Check if supplier has any purchases
            const purchases = await this.getSupplierPurchases(id);
            if (purchases && purchases.length > 0) {
                return {
                    success: false,
                    error: 'Cannot deactivate supplier with existing purchases. Archive purchases first.'
                };
            }

            const result = await SupplierRepository.delete(id);
            if (result.changes === 0) {
                return { success: false, error: 'Failed to deactivate supplier' };
            }

            return {
                success: true,
                message: `Supplier "${existing.name}" deactivated successfully`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getActiveSuppliers() {
        try {
            const suppliers = await SupplierRepository.getActive();
            return {
                success: true,
                data: suppliers,
                count: suppliers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async searchSuppliers(query) {
        try {
            if (!query || query.trim() === '') {
                return { success: false, error: 'Search query is required' };
            }

            const suppliers = await SupplierRepository.search(query.trim());
            return {
                success: true,
                data: suppliers,
                count: suppliers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== BALANCE (Credit/Debit) ====================
    async getSupplierBalance(id) {
        try {
            if (!id) {
                return { success: false, error: 'Supplier ID is required' };
            }

            const balance = await SupplierRepository.getBalance(id);
            if (!balance) {
                return { success: false, error: 'Supplier not found' };
            }

            return {
                success: true,
                data: {
                    credit: balance.credit || 0,
                    debit: balance.debit || 0,
                    balance: balance.balance || 0,
                    pending_due: balance.pending_due || 0
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateSupplierCredit(id, amount) {
        try {
            if (!id) {
                return { success: false, error: 'Supplier ID is required' };
            }

            if (!amount || amount <= 0) {
                return { success: false, error: 'Amount must be greater than 0' };
            }

            const existing = await SupplierRepository.getById(id);
            if (!existing) {
                return { success: false, error: 'Supplier not found' };
            }

            const result = await SupplierRepository.updateCredit(id, amount);
            if (result.changes === 0) {
                return { success: false, error: 'Failed to update credit' };
            }

            const balance = await SupplierRepository.getBalance(id);
            return {
                success: true,
                data: balance,
                message: `Credit updated successfully. New credit: ${balance.credit}`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateSupplierDebit(id, amount) {
        try {
            if (!id) {
                return { success: false, error: 'Supplier ID is required' };
            }

            if (!amount || amount <= 0) {
                return { success: false, error: 'Amount must be greater than 0' };
            }

            const existing = await SupplierRepository.getById(id);
            if (!existing) {
                return { success: false, error: 'Supplier not found' };
            }

            const result = await SupplierRepository.updateDebit(id, amount);
            if (result.changes === 0) {
                return { success: false, error: 'Failed to update debit' };
            }

            const balance = await SupplierRepository.getBalance(id);
            return {
                success: true,
                data: balance,
                message: `Debit updated successfully. New debit: ${balance.debit}`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateSupplierBalance(id, amount) {
        // Backward compatible - positive adds to credit, negative adds to debit
        try {
            if (!id) {
                return { success: false, error: 'Supplier ID is required' };
            }

            if (!amount || amount === 0) {
                return { success: false, error: 'Amount must be greater than 0' };
            }

            const existing = await SupplierRepository.getById(id);
            if (!existing) {
                return { success: false, error: 'Supplier not found' };
            }

            let result;
            if (amount > 0) {
                result = await SupplierRepository.updateCredit(id, amount);
            } else {
                result = await SupplierRepository.updateDebit(id, Math.abs(amount));
            }

            if (result.changes === 0) {
                return { success: false, error: 'Failed to update balance' };
            }

            const balance = await SupplierRepository.getBalance(id);
            return {
                success: true,
                data: balance,
                message: `Balance updated successfully. New balance: ${balance.balance}`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== STATS ====================
    async getSupplierStats() {
        try {
            const stats = await SupplierRepository.getSupplierStats();
            return {
                success: true,
                data: stats || {
                    total_suppliers: 0,
                    total_credit: 0,
                    total_debit: 0,
                    total_balance: 0,
                    total_purchases: 0,
                    total_purchase_amount: 0,
                    avg_purchase_amount: 0
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== ADDITIONAL METHODS ====================
    async getSupplierPurchases(supplierId) {
        try {
            const db = require("../database/database");
            const stmt = db.prepare(`
                SELECT * FROM purchases 
                WHERE supplier_id = ? 
                ORDER BY purchase_date DESC
            `);
            return stmt.all(supplierId);
        } catch (error) {
            return [];
        }
    }

    async getSuppliersWithHighBalance(minBalance = 10000) {
        try {
            const suppliers = await SupplierRepository.getSuppliersWithHighBalance(minBalance);
            return {
                success: true,
                data: suppliers,
                count: suppliers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTopSuppliers(limit = 10) {
        try {
            const suppliers = await SupplierRepository.getWithPurchaseCount();
            const top = suppliers.slice(0, limit);
            return {
                success: true,
                data: top,
                count: top.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getSupplierWithMostPurchases() {
        try {
            const supplier = await SupplierRepository.getSupplierWithMostPurchases();
            return {
                success: true,
                data: supplier || null
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== ADDITIONAL HELPER METHODS ====================
    async getSuppliersWithCredit() {
        try {
            const suppliers = await SupplierRepository.getSuppliersWithCredit();
            return {
                success: true,
                data: suppliers,
                count: suppliers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getSuppliersWithDebit() {
        try {
            const suppliers = await SupplierRepository.getSuppliersWithDebit();
            return {
                success: true,
                data: suppliers,
                count: suppliers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getSuppliersWithBalance() {
        try {
            const suppliers = await SupplierRepository.getSuppliersWithBalance();
            return {
                success: true,
                data: suppliers,
                count: suppliers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ==================== HELPER VALIDATION METHODS ====================
    validatePhone(phone) {
        const phoneRegex = /^(03\d{2})-?\d{7}$/;
        return phoneRegex.test(phone);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateCNIC(cnic) {
        const cnicRegex = /^\d{5}-?\d{7}-?\d{1}$/;
        return cnicRegex.test(cnic);
    }

    // ==================== BULK OPERATIONS ====================
    async bulkCreateSuppliers(suppliers) {
        const results = [];
        for (const supplier of suppliers) {
            const result = await this.createSupplier(supplier);
            results.push(result);
        }
        return results;
    }

    async exportSuppliers(filters = {}) {
        try {
            const suppliers = await SupplierRepository.getAll(filters);
            return {
                success: true,
                data: suppliers.map(s => ({
                    name: s.name,
                    phone: s.phone,
                    email: s.email,
                    address: s.address,
                    cnic: s.cnic,
                    credit: s.credit || 0,
                    debit: s.debit || 0,
                    balance: (s.credit || 0) - (s.debit || 0),
                    notes: s.notes,
                    status: s.is_active ? 'Active' : 'Inactive'
                })),
                count: suppliers.length
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getSupplierSummary() {
        try {
            const total = await SupplierRepository.getTotalSuppliers();
            const stats = await SupplierRepository.getSupplierStats();
            return {
                success: true,
                data: {
                    ...total,
                    ...stats
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new SupplierService();