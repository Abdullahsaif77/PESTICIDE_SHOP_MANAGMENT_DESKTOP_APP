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

            // Create supplier
            const result = await SupplierRepository.create({
                name: data.name.trim(),
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
                cnic: data.cnic || null,
                balance: data.balance || 0,
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
                    current_balance: balance.balance || 0,
                    pending_due: balance.pending_due || 0
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateSupplierBalance(id, amount) {
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

            const result = await SupplierRepository.updateBalance(id, amount);
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

    async getSupplierStats() {
        try {
            const stats = await SupplierRepository.getSupplierStats();
            return {
                success: true,
                data: stats || {
                    total_suppliers: 0,
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

    // Additional methods
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

    // ==================== HELPER VALIDATION METHODS ====================
    validatePhone(phone) {
        // Pakistan phone number format: 03XX-XXXXXXX or 03XXXXXXXXX
        const phoneRegex = /^(03\d{2})-?\d{7}$/;
        return phoneRegex.test(phone);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateCNIC(cnic) {
        // Pakistan CNIC format: XXXXX-XXXXXXX-X or XXXXXXXXXXXXX
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
                    balance: s.balance,
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