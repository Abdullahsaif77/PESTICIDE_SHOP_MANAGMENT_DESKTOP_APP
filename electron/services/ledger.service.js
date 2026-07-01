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
            created_by
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
        // For customers: debit = customer owes us, credit = we owe customer
        // For suppliers: credit = supplier owes us, debit = we owe supplier
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
            created_by: created_by || null
        });

        return {
            success: true,
            data: entry,
            message: 'Ledger entry created successfully'
        };
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
                summary
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
                summary
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
        const stats = ledgerRepository.getStats(filters);
        return {
            success: true,
            data: stats
        };
    }

    // ==================== AUTO CREATE FROM TRANSACTIONS ====================
    // This is called when a sale, purchase, or payment is created
    async autoCreateFromSale(saleData) {
        // Customer owes us -> debit entry
        return await this.createLedgerEntry({
            customer_id: saleData.customer_id,
            entry_type: 'debit',
            amount: saleData.total_amount,
            description: `Sale ${saleData.invoice_number}`,
            reference_type: 'sale',
            reference_id: saleData.id,
            created_by: saleData.created_by
        });
    }

    async autoCreateFromPurchase(purchaseData) {
        // We owe supplier -> debit entry for supplier
        return await this.createLedgerEntry({
            supplier_id: purchaseData.supplier_id,
            entry_type: 'debit',
            amount: purchaseData.total_amount,
            description: `Purchase ${purchaseData.purchase_number}`,
            reference_type: 'purchase',
            reference_id: purchaseData.id,
            created_by: purchaseData.created_by
        });
    }

    async autoCreateFromPayment(paymentData) {
        let entry = {
            amount: paymentData.amount,
            description: paymentData.description,
            reference_type: 'payment',
            reference_id: paymentData.id,
            created_by: paymentData.created_by
        };

        if (paymentData.customer_id) {
            // Customer made payment -> credit entry (customer owes less)
            entry.customer_id = paymentData.customer_id;
            entry.entry_type = 'credit';
        } else if (paymentData.supplier_id) {
            // We made payment to supplier -> credit entry for supplier (we owe less)
            entry.supplier_id = paymentData.supplier_id;
            entry.entry_type = 'credit';
        }

        return await this.createLedgerEntry(entry);
    }

    async autoCreateFromReceipt(receiptData) {
        let entry = {
            amount: receiptData.amount,
            description: receiptData.description,
            reference_type: 'receipt',
            reference_id: receiptData.id,
            created_by: receiptData.created_by
        };

        if (receiptData.customer_id) {
            // We received payment from customer -> credit entry
            entry.customer_id = receiptData.customer_id;
            entry.entry_type = 'credit';
        } else if (receiptData.supplier_id) {
            // Supplier paid us -> credit entry for supplier
            entry.supplier_id = receiptData.supplier_id;
            entry.entry_type = 'credit';
        }

        return await this.createLedgerEntry(entry);
    }
}

module.exports = new LedgerService();