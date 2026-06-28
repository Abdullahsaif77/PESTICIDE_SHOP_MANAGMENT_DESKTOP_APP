const db = require("../database/database")

class WareHouseRepository {
    create(data) {
        try {
            if (!data.name) throw new Error('Name is required')
            
            const stmt = db.prepare(`
                INSERT INTO warehouses (name, location, status) 
                VALUES (?, ?, ?)
            `)
            const result = stmt.run(data.name, data.location || null, data.status || 'active')
            return { success: true, id: result.lastInsertRowid }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    getByName(name) {
        try {
            const result = db.prepare('SELECT * FROM warehouses WHERE LOWER(name) = LOWER(?)').get(name)
            return { success: true, data: result || null }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }


    getById(id) {
        try {
            const result = db.prepare('SELECT * FROM warehouses WHERE id = ?').get(id)
            if (!result) return { success: false, error: 'Warehouse not found' }
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    update(id, data) {
        try {
            const updates = []
            const params = []

            if (data.name) {
                updates.push('name = ?')
                params.push(data.name)
            }
            if (data.location !== undefined) {
                updates.push('location = ?')
                params.push(data.location)
            }
            if (data.status) {
                updates.push('status = ?')
                params.push(data.status)
            }

            if (updates.length === 0) {
                return { success: false, error: 'No fields to update' }
            }

            updates.push('updated_at = CURRENT_TIMESTAMP')
            params.push(id)

            const query = `UPDATE warehouses SET ${updates.join(', ')} WHERE id = ?`
            const result = db.prepare(query).run(...params)
            
            if (result.changes === 0) {
                return { success: false, error: 'Warehouse not found' }
            }

            return { success: true, message: 'Updated successfully' }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    delete(id) {
        try {
            const result = db.prepare(`
                UPDATE warehouses 
                SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `).run(id)
            
            if (result.changes === 0) {
                return { success: false, error: 'Warehouse not found' }
            }
            return { success: true, message: 'Deleted successfully' }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    getActiveOnly() {
        try {
            const result = db.prepare(`
                SELECT * FROM warehouses WHERE status = 'active' ORDER BY name ASC
            `).all()
            return { success: true, data: result }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}

module.exports = new WareHouseRepository()