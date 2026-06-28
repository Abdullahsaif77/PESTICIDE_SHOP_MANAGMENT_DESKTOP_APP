// electron/services/customer.service.js

const customerRepository = require('../repositories/customer.repository');

class CustomerService {
    // ==================== CREATE ====================
    createCustomer(data) {
        // Validate required fields
        if (!data.name || data.name.trim() === '') {
            throw new Error('Customer name is required');
        }

        if (data.name.trim().length < 2) {
            throw new Error('Customer name must be at least 2 characters');
        }

        // Check duplicate name
        if (customerRepository.getByName(data.name.trim())) {
            throw new Error(`Customer "${data.name.trim()}" already exists`);
        }

        // Check duplicate CNIC
        if (data.cnic && customerRepository.getByCNIC(data.cnic)) {
            throw new Error(`Customer with CNIC "${data.cnic}" already exists`);
        }

        // Validate phone format
        if (data.phone && !/^(03\d{2})-?\d{7}$/.test(data.phone)) {
            throw new Error('Invalid phone format (e.g., 03XX-XXXXXXX)');
        }

        // Validate email format
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw new Error('Invalid email format');
        }

        // Validate CNIC format
        if (data.cnic && !/^\d{5}-?\d{7}-?\d{1}$/.test(data.cnic)) {
            throw new Error('Invalid CNIC format (e.g., XXXXX-XXXXXXX-X)');
        }

        // Prepare data
        const customerData = {
            name: data.name.trim(),
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
            cnic: data.cnic || null,
            balance: data.balance || 0,
            credit_limit: data.credit_limit || 0,
            notes: data.notes || null
        };

        const customer = customerRepository.create(customerData);
        return {
            success: true,
            data: customer,
            message: 'Customer created successfully'
        };
    }

    // ==================== READ ====================
    getAllCustomers(filters = {}) {
        const customers = customerRepository.getAll(filters);
        return {
            success: true,
            data: customers,
            count: customers.length
        };
    }

    getCustomerById(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid customer ID');
        }

        const customer = customerRepository.getById(id);
        if (!customer) {
            throw new Error('Customer not found');
        }

        return {
            success: true,
            data: customer
        };
    }

    getActiveCustomers() {
        const customers = customerRepository.getActive();
        return {
            success: true,
            data: customers,
            count: customers.length
        };
    }

    searchCustomers(query) {
        if (!query || query.trim() === '') {
            return this.getAllCustomers();
        }

        const customers = customerRepository.search(query.trim());
        return {
            success: true,
            data: customers,
            count: customers.length
        };
    }

    // ==================== UPDATE ====================
    updateCustomer(id, data) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid customer ID');
        }

        const existing = customerRepository.getById(id);
        if (!existing) {
            throw new Error('Customer not found');
        }

        // Validate name if provided
        if (data.name !== undefined) {
            if (!data.name || data.name.trim() === '') {
                throw new Error('Customer name is required');
            }
            if (data.name.trim().length < 2) {
                throw new Error('Customer name must be at least 2 characters');
            }

            // Check duplicate name (excluding current customer)
            const duplicate = customerRepository.getByName(data.name.trim());
            if (duplicate && duplicate.id !== id) {
                throw new Error(`Customer "${data.name.trim()}" already exists`);
            }
        }

        // Check duplicate CNIC if provided
        if (data.cnic) {
            const duplicate = customerRepository.getByCNIC(data.cnic);
            if (duplicate && duplicate.id !== id) {
                throw new Error(`Customer with CNIC "${data.cnic}" already exists`);
            }
        }

        // Validate phone format
        if (data.phone && !/^(03\d{2})-?\d{7}$/.test(data.phone)) {
            throw new Error('Invalid phone format (e.g., 03XX-XXXXXXX)');
        }

        // Validate email format
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            throw new Error('Invalid email format');
        }

        // Validate CNIC format
        if (data.cnic && !/^\d{5}-?\d{7}-?\d{1}$/.test(data.cnic)) {
            throw new Error('Invalid CNIC format (e.g., XXXXX-XXXXXXX-X)');
        }

        // Prepare update data
        const updateData = {};
        const fields = ['name', 'phone', 'email', 'address', 'cnic', 'balance', 'credit_limit', 'notes', 'is_active'];
        fields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = field === 'name' ? data[field].trim() : data[field];
            }
        });

        const customer = customerRepository.update(id, updateData);
        if (!customer) {
            throw new Error('Failed to update customer');
        }

        return {
            success: true,
            data: customer,
            message: 'Customer updated successfully'
        };
    }

    // ==================== DELETE ====================
    deleteCustomer(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid customer ID');
        }

        const existing = customerRepository.getById(id);
        if (!existing) {
            throw new Error('Customer not found');
        }

        const result = customerRepository.delete(id);
        if (!result) {
            throw new Error('Failed to delete customer');
        }

        return {
            success: true,
            message: 'Customer deactivated successfully'
        };
    }

    // ==================== BALANCE ====================
    getCustomerBalance(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid customer ID');
        }

        const result = customerRepository.getBalance(id);
        if (!result) {
            throw new Error('Customer not found');
        }

        return {
            success: true,
            data: {
                id,
                balance: result.balance
            }
        };
    }

    updateCustomerBalance(id, amount) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid customer ID');
        }

        if (!amount || isNaN(amount)) {
            throw new Error('Invalid amount');
        }

        const result = customerRepository.updateBalance(id, amount);
        if (!result) {
            throw new Error('Customer not found');
        }

        return {
            success: true,
            data: {
                id,
                newBalance: result.balance
            },
            message: 'Balance updated successfully'
        };
    }

    // ==================== STATS ====================
    getCustomerStats() {
        const stats = customerRepository.getStats();
        return {
            success: true,
            data: stats
        };
    }

    getTopCustomers(limit = 10) {
        const customers = customerRepository.getTopCustomers(limit);
        return {
            success: true,
            data: customers
        };
    }

    getCustomerWithSales(id) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid customer ID');
        }

        const result = customerRepository.getCustomerWithSales(id);
        if (!result) {
            throw new Error('Customer not found');
        }

        return {
            success: true,
            data: result
        };
    }

    // ==================== EXPORT ====================
    exportCustomers(filters = {}) {
        const data = customerRepository.exportData(filters);
        return {
            success: true,
            data
        };
    }
}

module.exports = new CustomerService();