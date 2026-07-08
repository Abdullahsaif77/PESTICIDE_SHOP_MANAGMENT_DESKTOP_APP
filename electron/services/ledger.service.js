// electron/services/ledger.service.js

const ledgerRepository = require('../repositories/ledger.repository');
const customerRepository = require('../repositories/customer.repository');
const supplierRepository = require('../repositories/supplier.repository');

class LedgerService {
    // ==================== CREATE ENTRY ====================
    async createLedgerEntry(data) {
        const {
            customer_id,
            supplier_id,
            entry_type,
            amount,
            description,
            reference_type,
            reference_id,
            created_by,
            entry_date  
        } = data;

        // Validate - must have either customer or supplier
        if (!customer_id && !supplier_id) {
            throw new Error('Either customer or supplier must be specified');
        }

        if (customer_id && supplier_id) {
            throw new Error('Cannot specify both customer and supplier');
        }

        // Validate amount
        if (!amount || amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        // Get current balance
        let currentBalance = 0;
        let entityName = '';

        if (customer_id) {
            const customer = customerRepository.getById(customer_id);
            if (!customer) {
                throw new Error('Customer not found');
            }
            entityName = customer.name;
            const balanceResult = ledgerRepository.getCustomerBalance(customer_id);
            currentBalance = balanceResult?.balance || 0;
        }

        if (supplier_id) {
            const supplier = supplierRepository.getById(supplier_id);
            if (!supplier) {
                throw new Error('Supplier not found');
            }
            entityName = supplier.name;
            const balanceResult = ledgerRepository.getSupplierBalance(supplier_id);
            currentBalance = balanceResult?.balance || 0;
        }

        // Calculate new balance
        let balanceAfter = currentBalance;
        if (entry_type === 'debit') {
            balanceAfter = currentBalance + amount;
        } else {
            balanceAfter = currentBalance - amount;
        }

        // Create ledger entry
        const entry = ledgerRepository.create({
            customer_id: customer_id || null,
            supplier_id: supplier_id || null,
            entry_type,
            amount,
            description: description || `${entry_type} entry for ${entityName}`,
            reference_type: reference_type || null,
            reference_id: reference_id || null,
            balance_after: balanceAfter,
            created_by: created_by || null,
            entry_date: entry_date || null 
        });

        return {
            success: true,
            data: entry,
            message: 'Ledger entry created successfully'
        };
    }

    // ==================== PAYMENT / RECEIPT METHODS ====================
    
    async recordCustomerPayment(customerId, amount, paymentMethod = 'cash', referenceId = null, notes = '') {
        if (!customerId) {
            throw new Error('Customer ID is required');
        }
        if (!amount || amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const customer = customerRepository.getById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        const entry = await this.createLedgerEntry({
            customer_id: customerId,
            entry_type: 'credit',
            amount: amount,
            description: `Payment received from ${customer.name}${notes ? ` - ${notes}` : ''}`,
            reference_type: 'payment',
            reference_id: referenceId,
            created_by: null
        });

        await this.updateCustomerBalance(customerId, -amount);

        return {
            success: true,
            data: entry,
            message: `Payment of ${amount} received from ${customer.name}`
        };
    }

    async recordSupplierPayment(supplierId, amount, paymentMethod = 'cash', referenceId = null, notes = '') {
        console.log(`💰 recordSupplierPayment called: supplier ${supplierId}, amount ${amount}`);
        
        if (!supplierId) {
            throw new Error('Supplier ID is required');
        }
        if (!amount || amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const supplier = supplierRepository.getById(supplierId);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        const entry = await this.createLedgerEntry({
            supplier_id: supplierId,
            entry_type: 'credit',
            amount: amount,
            description: `Payment made to ${supplier.name}${notes ? ` - ${notes}` : ''}`,
            reference_type: 'payment',
            reference_id: referenceId,
            created_by: null
        });

        await this.updateSupplierBalance(supplierId, -amount);

        return {
            success: true,
            data: entry,
            message: `Payment of ${amount} made to ${supplier.name}`
        };
    }

    async recordReceipt(customerId, amount, paymentMethod = 'cash', referenceId = null, notes = '') {
        return this.recordCustomerPayment(customerId, amount, paymentMethod, referenceId, notes);
    }

    async adjustCustomerBalance(customerId, amount, reason = 'Manual adjustment', referenceId = null) {
        if (!customerId) {
            throw new Error('Customer ID is required');
        }
        if (!amount || amount === 0) {
            throw new Error('Amount must be non-zero');
        }

        const customer = customerRepository.getById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        const entryType = amount > 0 ? 'debit' : 'credit';
        const absAmount = Math.abs(amount);
        const description = `${reason} (${entryType === 'debit' ? 'Increase' : 'Decrease'} balance)`;

        const entry = await this.createLedgerEntry({
            customer_id: customerId,
            entry_type: entryType,
            amount: absAmount,
            description: description,
            reference_type: 'adjustment',
            reference_id: referenceId,
            created_by: null
        });

        await this.updateCustomerBalance(customerId, amount);

        return {
            success: true,
            data: entry,
            message: `Customer balance adjusted by ${amount}`
        };
    }

    async adjustSupplierBalance(supplierId, amount, reason = 'Manual adjustment', referenceId = null) {
        if (!supplierId) {
            throw new Error('Supplier ID is required');
        }
        if (!amount || amount === 0) {
            throw new Error('Amount must be non-zero');
        }

        const supplier = supplierRepository.getById(supplierId);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        const entryType = amount > 0 ? 'debit' : 'credit';
        const absAmount = Math.abs(amount);
        const description = `${reason} (${entryType === 'debit' ? 'Increase' : 'Decrease'} balance)`;

        const entry = await this.createLedgerEntry({
            supplier_id: supplierId,
            entry_type: entryType,
            amount: absAmount,
            description: description,
            reference_type: 'adjustment',
            reference_id: referenceId,
            created_by: null
        });

        await this.updateSupplierBalance(supplierId, amount);

        return {
            success: true,
            data: entry,
            message: `Supplier balance adjusted by ${amount}`
        };
    }

    // ==================== HELPER METHODS ====================
    
    async updateCustomerBalance(customerId, amount) {
        const customer = customerRepository.getById(customerId);
        if (!customer) return;

        let currentDebit = customer.debit || 0;
        let currentCredit = customer.credit || 0;
        let remainingAmount = Math.abs(amount);
        const isPayment = amount < 0;

        if (isPayment) {
            // ✅ PAYMENT: Reduce DEBIT first
            if (currentDebit > 0) {
                const debitReduction = Math.min(remainingAmount, currentDebit);
                currentDebit = currentDebit - debitReduction;
                remainingAmount = remainingAmount - debitReduction;
                console.log(`✅ Reduced DEBIT by ${debitReduction}, new DEBIT: ${currentDebit}`);
            }

            // If there's remaining amount, add to CREDIT (overpayment)
            if (remainingAmount > 0) {
                currentCredit = currentCredit + remainingAmount;
                console.log(`✅ Added ${remainingAmount} to CREDIT (overpayment), new CREDIT: ${currentCredit}`);
            }

            customerRepository.update(customerId, { 
                debit: currentDebit, 
                credit: currentCredit 
            });
        } else {
            // Amount is positive - customer owes more (DEBIT increases)
            currentDebit = currentDebit + amount;
            customerRepository.update(customerId, { debit: currentDebit });
        }
    }

    async updateSupplierBalance(supplierId, amount) {
        const supplier = supplierRepository.getById(supplierId);
        if (!supplier) return;

        let currentDebit = supplier.debit || 0;
        let currentCredit = supplier.credit || 0;
        let remainingAmount = Math.abs(amount);
        const isPayment = amount < 0;

        console.log(`📊 Current balances - Debit: ${currentDebit}, Credit: ${currentCredit}`);

        if (isPayment) {
            console.log(`💳 Processing payment of ${remainingAmount}`);
            
            // ✅ PAYMENT: Reduce DEBIT first (amount we owe)
            if (currentDebit > 0) {
                const debitReduction = Math.min(remainingAmount, currentDebit);
                currentDebit = currentDebit - debitReduction;
                remainingAmount = remainingAmount - debitReduction;
                console.log(`  ✅ Reduced DEBIT by ${debitReduction}, new DEBIT: ${currentDebit}`);
            }

            // If there's remaining amount, add to CREDIT (overpayment)
            if (remainingAmount > 0) {
                currentCredit = currentCredit + remainingAmount;
                console.log(`  ✅ Added ${remainingAmount} to CREDIT (overpayment), new CREDIT: ${currentCredit}`);
            }

            // Update supplier
            supplierRepository.update(supplierId, { 
                debit: currentDebit, 
                credit: currentCredit 
            });
        } else {
            // Amount is positive - we owe more (DEBIT increases)
            currentDebit = currentDebit + amount;
            supplierRepository.update(supplierId, { debit: currentDebit });
            console.log(`  ➕ Added ${amount} to DEBIT, new DEBIT: ${currentDebit}`);
        }
        
        // Verify the update
        const updated = supplierRepository.getById(supplierId);
        console.log(`✅ Supplier updated - Debit: ${updated.debit}, Credit: ${updated.credit}`);
    }

    // ==================== AUTO CREATE FROM TRANSACTIONS ====================
    async autoCreateFromSale(saleData) {
        return await this.createLedgerEntry({
            customer_id: saleData.customer_id,
            entry_type: 'debit',
            amount: saleData.total_amount,
            description: `Sale ${saleData.invoice_number}`,
            reference_type: 'sale',
            reference_id: saleData.id,
            created_by: saleData.created_by,
            entry_date: saleData.entry_date || null
        });
    }

    async autoCreateFromPurchase(purchaseData) {
        return await this.createLedgerEntry({
            supplier_id: purchaseData.supplier_id,
            entry_type: 'debit',
            amount: purchaseData.total_amount,
            description: `Purchase ${purchaseData.purchase_number}`,
            reference_type: 'purchase',
            reference_id: purchaseData.id,
            created_by: purchaseData.created_by,
            entry_date: purchaseData.entry_date || purchaseData.purchase_date
        });
    }

    // ==================== GET LEDGER ====================
    getCustomerLedger(customerId, filters = {}) {
        if (!customerId || isNaN(customerId)) {
            throw new Error('Invalid customer ID');
        }

        const entries = ledgerRepository.getCustomerLedger(customerId, filters);
        const summary = ledgerRepository.getCustomerLedgerSummary(customerId);

        return {
            success: true,
            data: {
                entries,
                summary: {
                    total_entries: summary.total_entries || 0,
                    total_debit: summary.remaining_debit || 0,
                    total_credit: summary.remaining_credit || 0,
                    balance: summary.balance || 0
                }
            }
        };
    }

    getSupplierLedger(supplierId, filters = {}) {
        if (!supplierId || isNaN(supplierId)) {
            throw new Error('Invalid supplier ID');
        }

        const entries = ledgerRepository.getSupplierLedger(supplierId, filters);
        const summary = ledgerRepository.getSupplierLedgerSummary(supplierId);

        return {
            success: true,
            data: {
                entries,
                summary: {
                    total_entries: summary.total_entries || 0,
                    total_debit: summary.remaining_debit || 0,
                    total_credit: summary.remaining_credit || 0,
                    balance: summary.balance || 0
                }
            }
        };
    }

    getAllLedger(filters = {}) {
        const entries = ledgerRepository.getAll(filters);
        const stats = ledgerRepository.getStats(filters);

        return {
            success: true,
            data: {
                entries,
                stats
            }
        };
    }

    getLedgerById(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid ledger ID');
        }

        const entry = ledgerRepository.getById(id);
        if (!entry) {
            throw new Error('Ledger entry not found');
        }

        return {
            success: true,
            data: entry
        };
    }

    // ==================== DELETE ====================
    deleteLedgerEntry(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid ledger ID');
        }

        const existing = ledgerRepository.getById(id);
        if (!existing) {
            throw new Error('Ledger entry not found');
        }

        const result = ledgerRepository.delete(id);
        if (!result) {
            throw new Error('Failed to delete ledger entry');
        }

        return {
            success: true,
            message: 'Ledger entry deleted successfully'
        };
    }

    // ==================== BALANCE ====================
    getCustomerBalance(customerId) {
        if (!customerId || isNaN(customerId)) {
            throw new Error('Invalid customer ID');
        }

        const balance = ledgerRepository.getCustomerBalance(customerId);
        return {
            success: true,
            data: balance
        };
    }

    getSupplierBalance(supplierId) {
        if (!supplierId || isNaN(supplierId)) {
            throw new Error('Invalid supplier ID');
        }

        const balance = ledgerRepository.getSupplierBalance(supplierId);
        return {
            success: true,
            data: balance
        };
    }

    // ==================== STATS ====================
    getLedgerStats(filters = {}) {
        try {
            const stats = ledgerRepository.getStats(filters);
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('Error getting ledger stats:', error);
            return {
                success: false,
                data: {
                    totalEntries: 0,
                    totalDebit: 0,
                    totalCredit: 0,
                    totalCustomers: 0,
                    totalSuppliers: 0
                },
                error: error.message
            };
        }
    }

    // ==================== ✅ NEW: CUSTOMER LEDGER STATS ====================
    async getCustomerLedgerStats(customerId) {
        if (!customerId || isNaN(customerId)) {
            throw new Error('Invalid customer ID');
        }

        try {
            const entries = ledgerRepository.getCustomerLedger(customerId);
            
            let totalDebit = 0;
            let totalCredit = 0;
            let totalEntries = entries.length;
            let totalSales = 0;
            let totalSalesAmount = 0;

            for (const entry of entries) {
                if (entry.entry_type === 'debit') {
                    totalDebit += entry.amount;
                    if (entry.reference_type === 'sale') {
                        totalSales++;
                        totalSalesAmount += entry.amount;
                    }
                } else if (entry.entry_type === 'credit') {
                    totalCredit += entry.amount;
                }
            }

            const netBalance = totalDebit - totalCredit;

            return {
                success: true,
                data: {
                    customer_id: customerId,
                    totalEntries,
                    totalDebit,
                    totalCredit,
                    netBalance,
                    totalSales,
                    totalSalesAmount
                }
            };
        } catch (error) {
            console.error('Error getting customer ledger stats:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    totalEntries: 0,
                    totalDebit: 0,
                    totalCredit: 0,
                    netBalance: 0,
                    totalSales: 0,
                    totalSalesAmount: 0
                }
            };
        }
    }

    async getAllCustomerLedgerStats() {
        try {
            const customers = customerRepository.getAll();
            const stats = [];

            for (const customer of customers) {
                const result = await this.getCustomerLedgerStats(customer.id);
                if (result.success) {
                    stats.push({
                        ...customer,
                        ...result.data
                    });
                } else {
                    stats.push({
                        ...customer,
                        totalEntries: 0,
                        totalDebit: 0,
                        totalCredit: 0,
                        netBalance: 0,
                        totalSales: 0,
                        totalSalesAmount: 0
                    });
                }
            }

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('Error getting all customer ledger stats:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    async getSupplierLedgerStats(supplierId) {
        if (!supplierId || isNaN(supplierId)) {
            throw new Error('Invalid supplier ID');
        }

        try {
            const entries = ledgerRepository.getSupplierLedger(supplierId);
            
            let totalDebit = 0;
            let totalCredit = 0;
            let totalEntries = entries.length;
            let totalPurchases = 0;
            let totalPurchasesAmount = 0;

            for (const entry of entries) {
                if (entry.entry_type === 'debit') {
                    totalDebit += entry.amount;
                    if (entry.reference_type === 'purchase') {
                        totalPurchases++;
                        totalPurchasesAmount += entry.amount;
                    }
                } else if (entry.entry_type === 'credit') {
                    totalCredit += entry.amount;
                }
            }

            const netBalance = totalDebit - totalCredit;

            return {
                success: true,
                data: {
                    supplier_id: supplierId,
                    totalEntries,
                    totalDebit,
                    totalCredit,
                    netBalance,
                    totalPurchases,
                    totalPurchasesAmount
                }
            };
        } catch (error) {
            console.error('Error getting supplier ledger stats:', error);
            return {
                success: false,
                error: error.message,
                data: {
                    totalEntries: 0,
                    totalDebit: 0,
                    totalCredit: 0,
                    netBalance: 0,
                    totalPurchases: 0,
                    totalPurchasesAmount: 0
                }
            };
        }
    }

    async getAllSupplierLedgerStats() {
        try {
            const suppliers = supplierRepository.getAll();
            const stats = [];

            for (const supplier of suppliers) {
                const result = await this.getSupplierLedgerStats(supplier.id);
                if (result.success) {
                    stats.push({
                        ...supplier,
                        ...result.data
                    });
                } else {
                    stats.push({
                        ...supplier,
                        totalEntries: 0,
                        totalDebit: 0,
                        totalCredit: 0,
                        netBalance: 0,
                        totalPurchases: 0,
                        totalPurchasesAmount: 0
                    });
                }
            }

            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('Error getting all supplier ledger stats:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
}

module.exports = new LedgerService();