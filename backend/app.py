from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import sqlite3
import os
import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
jwt = JWTManager(app)

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'fintrack.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Create accounts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Create transactions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        profile_id INTEGER,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        is_shared BOOLEAN DEFAULT 0,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (account_id) REFERENCES accounts (id),
        FOREIGN KEY (profile_id) REFERENCES profiles (id)
    )
    ''')

    # Create budgets table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        period TEXT NOT NULL,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Create profiles table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,  -- 'primary', 'spouse', 'child', etc.
        photo_url TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Insert demo user if not exists
    cursor.execute("SELECT id FROM users WHERE username = 'demo'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            ('demo', 'demo@example.com', 'password')  # In production, hash the password!
        )

        # Get the user ID
        user_id = cursor.lastrowid

        # Insert demo profiles
        profiles = [
            (user_id, 'Dr. Ravi', 'primary', 'profile_ravi.jpg', 1),
            (user_id, 'Mrs. Ravi', 'spouse', 'profile_spouse.jpg', 1)
        ]
        cursor.executemany(
            "INSERT INTO profiles (user_id, name, type, photo_url, is_active) VALUES (?, ?, ?, ?, ?)",
            profiles
        )

        # Get profile IDs
        cursor.execute("SELECT id FROM profiles WHERE user_id = ? AND type = 'primary'", (user_id,))
        primary_profile_id = cursor.fetchone()[0]
        cursor.execute("SELECT id FROM profiles WHERE user_id = ? AND type = 'spouse'", (user_id,))
        spouse_profile_id = cursor.fetchone()[0]

        # Insert demo accounts
        accounts = [
            (user_id, 'HDFC Bank', 'Checking', 25000),
            (user_id, 'ICICI Bank', 'Savings', 75000),
            (user_id, 'Cash', 'Cash', 5000),
            (user_id, 'Zerodha', 'Investment', 150000),
            (user_id, 'Spouse Salary Account', 'Checking', 35000)
        ]
        cursor.executemany(
            "INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?)",
            accounts
        )

        # Insert demo transactions
        transactions = [
            # Primary profile transactions
            (user_id, 1, primary_profile_id, -2500, 'expense', 'Food', 'Grocery shopping', 0, '2023-04-15'),
            (user_id, 2, primary_profile_id, 45000, 'income', 'Salary', 'Monthly salary', 0, '2023-04-01'),
            (user_id, 3, primary_profile_id, -1850, 'expense', 'Utilities', 'Electricity bill', 1, '2023-04-10'),

            # Spouse profile transactions
            (user_id, 5, spouse_profile_id, 35000, 'income', 'Salary', 'Monthly salary', 0, '2023-04-01'),
            (user_id, 5, spouse_profile_id, -1200, 'expense', 'Shopping', 'Clothes shopping', 0, '2023-04-05'),

            # Shared transactions
            (user_id, 1, None, -3200, 'expense', 'Food', 'Restaurant dinner', 1, '2023-04-08'),
            (user_id, 4, None, 12500, 'income', 'Investment', 'Dividend', 1, '2023-04-05'),
            (user_id, 1, None, -999, 'expense', 'Utilities', 'Mobile bill', 1, '2023-04-12'),
            (user_id, 2, primary_profile_id, 15000, 'income', 'Freelance', 'Website project', 0, '2023-04-07'),
            (user_id, 1, None, -800, 'expense', 'Entertainment', 'Movie tickets', 1, '2023-04-09'),
            (user_id, 3, None, -1499, 'expense', 'Utilities', 'Internet bill', 1, '2023-04-11'),
            (user_id, 1, None, -18000, 'expense', 'Housing', 'Rent payment', 1, '2023-04-03')
        ]
        cursor.executemany(
            "INSERT INTO transactions (user_id, account_id, profile_id, amount, type, category, description, is_shared, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            transactions
        )

        # Insert demo budgets
        budgets = [
            (user_id, 'Food', 10000, 'monthly', '2023-04-01', '2023-04-30'),
            (user_id, 'Utilities', 5000, 'monthly', '2023-04-01', '2023-04-30'),
            (user_id, 'Housing', 20000, 'monthly', '2023-04-01', '2023-04-30'),
            (user_id, 'Entertainment', 3000, 'monthly', '2023-04-01', '2023-04-30'),
            (user_id, 'Transportation', 4000, 'monthly', '2023-04-01', '2023-04-30')
        ]
        cursor.executemany(
            "INSERT INTO budgets (user_id, category, amount, period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)",
            budgets
        )

    conn.commit()
    conn.close()

# Initialize database
init_db()

# Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username FROM users WHERE username = ? AND password = ?", (username, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        access_token = create_access_token(identity=user[0])
        return jsonify(access_token=access_token, username=user[1]), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get account balances
    cursor.execute("SELECT SUM(balance) as total_balance FROM accounts WHERE user_id = ?", (user_id,))
    total_balance = cursor.fetchone()['total_balance']

    # Get monthly income
    cursor.execute("""
        SELECT SUM(amount) as monthly_income
        FROM transactions
        WHERE user_id = ? AND type = 'income' AND date >= date('now', 'start of month')
    """, (user_id,))
    monthly_income = cursor.fetchone()['monthly_income'] or 0

    # Get monthly expenses
    cursor.execute("""
        SELECT SUM(ABS(amount)) as monthly_expenses
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND date >= date('now', 'start of month')
    """, (user_id,))
    monthly_expenses = cursor.fetchone()['monthly_expenses'] or 0

    # Get investment value
    cursor.execute("""
        SELECT SUM(balance) as investment_value
        FROM accounts
        WHERE user_id = ? AND type = 'Investment'
    """, (user_id,))
    investment_value = cursor.fetchone()['investment_value'] or 0

    # Get recent transactions
    cursor.execute("""
        SELECT t.id, t.amount, t.type, t.category, t.description, t.date, a.name as account_name
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE t.user_id = ?
        ORDER BY t.date DESC
        LIMIT 5
    """, (user_id,))
    recent_transactions = [dict(tx) for tx in cursor.fetchall()]

    # Get expense breakdown
    cursor.execute("""
        SELECT category, SUM(ABS(amount)) as amount
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND date >= date('now', 'start of month')
        GROUP BY category
    """, (user_id,))
    expense_breakdown = [dict(item) for item in cursor.fetchall()]

    # Get monthly data for chart
    cursor.execute("""
        SELECT
            strftime('%m', date) as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as expenses
        FROM transactions
        WHERE user_id = ? AND date >= date('now', '-6 months')
        GROUP BY strftime('%m-%Y', date)
        ORDER BY date
    """, (user_id,))
    monthly_data = [dict(item) for item in cursor.fetchall()]

    conn.close()

    return jsonify({
        'stats': {
            'total_balance': total_balance,
            'monthly_income': monthly_income,
            'monthly_expenses': monthly_expenses,
            'investment_value': investment_value
        },
        'recent_transactions': recent_transactions,
        'expense_breakdown': expense_breakdown,
        'monthly_data': monthly_data
    })

@app.route('/api/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    profile_id = request.args.get('profile_id', None)
    show_shared = request.args.get('show_shared', 'true').lower() == 'true'

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query = """
        SELECT t.id, t.amount, t.type, t.category, t.description, t.date, t.is_shared,
               a.name as account_name, p.name as profile_name, p.photo_url as profile_photo
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        LEFT JOIN profiles p ON t.profile_id = p.id
        WHERE t.user_id = ?
    """

    params = [user_id]

    if profile_id and profile_id != 'all':
        query += " AND (t.profile_id = ? OR (t.is_shared = 1 AND ?))"
        params.extend([profile_id, show_shared])
    elif not show_shared:
        query += " AND t.is_shared = 0"

    query += " ORDER BY t.date DESC"

    cursor.execute(query, params)

    transactions = [dict(tx) for tx in cursor.fetchall()]
    conn.close()

    return jsonify(transactions)

@app.route('/api/transactions', methods=['POST'])
@jwt_required()
def add_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()

    account_id = data.get('account_id')
    profile_id = data.get('profile_id')  # Can be None for shared transactions
    amount = data.get('amount')
    transaction_type = data.get('type')
    category = data.get('category')
    description = data.get('description')
    is_shared = data.get('is_shared', False)
    date = data.get('date', datetime.datetime.now().strftime('%Y-%m-%d'))

    # Adjust amount based on transaction type
    if transaction_type == 'expense':
        amount = -abs(amount)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Insert transaction
    cursor.execute(
        "INSERT INTO transactions (user_id, account_id, profile_id, amount, type, category, description, is_shared, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (user_id, account_id, profile_id, amount, transaction_type, category, description, is_shared, date)
    )

    transaction_id = cursor.lastrowid

    # Update account balance
    cursor.execute(
        "UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?",
        (amount, account_id, user_id)
    )

    conn.commit()

    # Get the created transaction with profile info
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.id, t.amount, t.type, t.category, t.description, t.date, t.is_shared,
               a.name as account_name, p.name as profile_name, p.photo_url as profile_photo
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        LEFT JOIN profiles p ON t.profile_id = p.id
        WHERE t.id = ?
    """, (transaction_id,))

    transaction = dict(cursor.fetchone())
    conn.close()

    return jsonify({"msg": "Transaction added successfully", "transaction": transaction}), 201

@app.route('/api/accounts', methods=['GET'])
@jwt_required()
def get_accounts():
    user_id = get_jwt_identity()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, type, balance FROM accounts WHERE user_id = ?", (user_id,))
    accounts = [dict(account) for account in cursor.fetchall()]
    conn.close()

    return jsonify(accounts)

@app.route('/api/profiles', methods=['GET'])
@jwt_required()
def get_profiles():
    user_id = get_jwt_identity()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, type, photo_url, is_active FROM profiles WHERE user_id = ?", (user_id,))
    profiles = [dict(profile) for profile in cursor.fetchall()]
    conn.close()

    return jsonify(profiles)

@app.route('/api/profiles/<int:profile_id>', methods=['GET'])
@jwt_required()
def get_profile(profile_id):
    user_id = get_jwt_identity()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, type, photo_url, is_active FROM profiles WHERE id = ? AND user_id = ?", (profile_id, user_id))
    profile = cursor.fetchone()

    if not profile:
        conn.close()
        return jsonify({"msg": "Profile not found"}), 404

    conn.close()
    return jsonify(dict(profile))

@app.route('/api/profiles', methods=['POST'])
@jwt_required()
def add_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    name = data.get('name')
    profile_type = data.get('type')
    photo_url = data.get('photo_url')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO profiles (user_id, name, type, photo_url, is_active) VALUES (?, ?, ?, ?, ?)",
        (user_id, name, profile_type, photo_url, 1)
    )

    profile_id = cursor.lastrowid
    conn.commit()

    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, type, photo_url, is_active FROM profiles WHERE id = ?", (profile_id,))
    profile = cursor.fetchone()

    conn.close()
    return jsonify({"msg": "Profile added successfully", "profile": dict(profile)}), 201

@app.route('/api/profiles/<int:profile_id>', methods=['PUT'])
@jwt_required()
def update_profile(profile_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    name = data.get('name')
    profile_type = data.get('type')
    photo_url = data.get('photo_url')
    is_active = data.get('is_active')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if profile exists and belongs to user
    cursor.execute("SELECT id FROM profiles WHERE id = ? AND user_id = ?", (profile_id, user_id))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"msg": "Profile not found or not authorized"}), 404

    # Update profile
    cursor.execute(
        "UPDATE profiles SET name = ?, type = ?, photo_url = ?, is_active = ? WHERE id = ? AND user_id = ?",
        (name, profile_type, photo_url, is_active, profile_id, user_id)
    )

    conn.commit()

    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, type, photo_url, is_active FROM profiles WHERE id = ?", (profile_id,))
    profile = cursor.fetchone()

    conn.close()
    return jsonify({"msg": "Profile updated successfully", "profile": dict(profile)})

@app.route('/api/budgets', methods=['GET'])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get all budgets for the user
    cursor.execute("""
        SELECT b.id, b.category, b.amount, b.period, b.start_date, b.end_date,
               COALESCE(SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) as spent
        FROM budgets b
        LEFT JOIN transactions t ON b.user_id = t.user_id AND b.category = t.category
            AND t.date BETWEEN b.start_date AND b.end_date
        WHERE b.user_id = ?
        GROUP BY b.id
        ORDER BY b.category
    """, (user_id,))

    budgets = [dict(budget) for budget in cursor.fetchall()]
    conn.close()

    return jsonify(budgets)

@app.route('/api/budgets', methods=['POST'])
@jwt_required()
def add_budget():
    user_id = get_jwt_identity()
    data = request.get_json()

    category = data.get('category')
    amount = data.get('amount')
    period = data.get('period', 'monthly')

    # Calculate start and end dates based on period
    today = datetime.datetime.now()
    start_date = today.replace(day=1).strftime('%Y-%m-%d')  # First day of current month

    if period == 'monthly':
        # Last day of current month
        if today.month == 12:
            end_date = today.replace(year=today.year + 1, month=1, day=1) - datetime.timedelta(days=1)
        else:
            end_date = today.replace(month=today.month + 1, day=1) - datetime.timedelta(days=1)
    elif period == 'weekly':
        # Start from Monday of current week
        start_date = (today - datetime.timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        # End on Sunday of current week
        end_date = (today + datetime.timedelta(days=6-today.weekday()))
    elif period == 'yearly':
        # Start from January 1st of current year
        start_date = today.replace(month=1, day=1).strftime('%Y-%m-%d')
        # End on December 31st of current year
        end_date = today.replace(month=12, day=31)
    else:  # Default to monthly
        if today.month == 12:
            end_date = today.replace(year=today.year + 1, month=1, day=1) - datetime.timedelta(days=1)
        else:
            end_date = today.replace(month=today.month + 1, day=1) - datetime.timedelta(days=1)

    end_date = end_date.strftime('%Y-%m-%d')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if budget for this category and period already exists
    cursor.execute("""
        SELECT id FROM budgets
        WHERE user_id = ? AND category = ? AND period = ?
        AND start_date = ? AND end_date = ?
    """, (user_id, category, period, start_date, end_date))

    existing_budget = cursor.fetchone()

    if existing_budget:
        # Update existing budget
        cursor.execute("""
            UPDATE budgets SET amount = ?
            WHERE id = ?
        """, (amount, existing_budget[0]))
        budget_id = existing_budget[0]
        message = "Budget updated successfully"
    else:
        # Insert new budget
        cursor.execute("""
            INSERT INTO budgets (user_id, category, amount, period, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, category, amount, period, start_date, end_date))
        budget_id = cursor.lastrowid
        message = "Budget created successfully"

    conn.commit()

    # Get the created/updated budget with spent amount
    cursor.execute("""
        SELECT b.id, b.category, b.amount, b.period, b.start_date, b.end_date,
               COALESCE(SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) as spent
        FROM budgets b
        LEFT JOIN transactions t ON b.user_id = t.user_id AND b.category = t.category
            AND t.date BETWEEN b.start_date AND b.end_date
        WHERE b.id = ?
        GROUP BY b.id
    """, (budget_id,))

    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.id, b.category, b.amount, b.period, b.start_date, b.end_date
        FROM budgets b
        WHERE b.id = ?
    """, (budget_id,))

    budget = dict(cursor.fetchone())
    conn.close()

    return jsonify({"msg": message, "budget": budget}), 201

@app.route('/api/budgets/<int:budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    category = data.get('category')
    amount = data.get('amount')
    period = data.get('period')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if budget exists and belongs to user
    cursor.execute("SELECT id FROM budgets WHERE id = ? AND user_id = ?", (budget_id, user_id))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"msg": "Budget not found or not authorized"}), 404

    # Update budget
    cursor.execute("""
        UPDATE budgets
        SET category = ?, amount = ?, period = ?
        WHERE id = ? AND user_id = ?
    """, (category, amount, period, budget_id, user_id))

    conn.commit()

    # Get updated budget
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.id, b.category, b.amount, b.period, b.start_date, b.end_date,
               COALESCE(SUM(CASE WHEN t.type = 'expense' THEN ABS(t.amount) ELSE 0 END), 0) as spent
        FROM budgets b
        LEFT JOIN transactions t ON b.user_id = t.user_id AND b.category = t.category
            AND t.date BETWEEN b.start_date AND b.end_date
        WHERE b.id = ?
        GROUP BY b.id
    """, (budget_id,))

    budget = dict(cursor.fetchone()) if cursor.fetchone() else None
    conn.close()

    if budget:
        return jsonify({"msg": "Budget updated successfully", "budget": budget})
    else:
        return jsonify({"msg": "Budget updated but could not retrieve details"}), 200

@app.route('/api/budgets/<int:budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    user_id = get_jwt_identity()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if budget exists and belongs to user
    cursor.execute("SELECT id FROM budgets WHERE id = ? AND user_id = ?", (budget_id, user_id))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"msg": "Budget not found or not authorized"}), 404

    # Delete budget
    cursor.execute("DELETE FROM budgets WHERE id = ? AND user_id = ?", (budget_id, user_id))
    conn.commit()
    conn.close()

    return jsonify({"msg": "Budget deleted successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
