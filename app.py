from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage
import jwt
import datetime
import random
import string
import os
from dotenv import load_dotenv
from passlib.hash import pbkdf2_sha256  # ✅ Secure password hashing without C++ dependency
import requests 
from datetime import datetime, timedelta
import pytz


# Load environment variables
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Add route to serve static files
@app.route('/')
def serve_index():
    return send_from_directory('', 'index.html')

@app.route('/templates/<path:path>')
def serve_template(path):
    return send_from_directory('templates', path)

# Firebase Setup
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS")  # Path to Firebase credentials JSON
if not firebase_cred_path:
    raise ValueError("FIREBASE_CREDENTIALS environment variable is not set.")
cred = credentials.Certificate(firebase_cred_path)


firebase_admin.initialize_app(cred, {
    'storageBucket': 'quickbyte-f4aba.firebasestorage.app'  # Replace this with your Firebase storage bucket URL
    
})
db = firestore.client()

IMGBB_API_KEY = '2119283ed75da85ab4d6d45e74dfda5b'

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set.")

# Helper function to generate a random token
def generate_reset_token(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# Input validation for email and password
def validate_input(email, password):
    if not email or not password:
        return False, "Email and password are required"
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    return True, None

# Add this near the top of app.py, with other constants
DELIVERY_LOCATIONS = {
    'PICKUP': {'charge': 0, 'label': 'Canteen Pickup'},
    'CLASS': {'charge': 20, 'label': 'Classroom Delivery'}
}

# Add this with other constants
ORDER_STATUS = {
    'PENDING': 'pending',
    'ACCEPTED': 'accepted',
    'READY': 'ready',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled'
}

# Add this constant for time slots
MEAL_TIMINGS = {
    'MORNING_BREAK': {
        'start': '10:30',
        'end': '11:00',
        'label': 'Morning Break'
    },
    'LUNCH': {
        'start': '12:30',
        'end': '13:30',
        'label': 'Lunch'
    },
    'AFTERNOON_BREAK': {
        'start': '15:30',
        'end': '16:00',
        'label': 'Afternoon Break'
    }
}

# Add this with other constants
NOTIFICATION_TYPES = {
    'ORDER_READY': 'order_ready',
    'ORDER_CANCELLED': 'order_cancelled',
    'REFUND_PROCESSED': 'refund_processed'
}

# Add helper function for creating notifications
def create_notification(user_email, type, message, order_id=None):
    try:
        # Create notification with auto-generated ID
        notification_ref = db.collection('notifications').document()
        
        notification_data = {
            'user_email': user_email,
            'type': type,
            'message': message,
            'order_id': order_id,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'read': False
        }
        
        # Set the notification document
        notification_ref.set(notification_data)
        
        print(f"Created notification for {user_email}: {message}")  # Debug log
        return True
    except Exception as e:
        print(f"Error creating notification: {str(e)}")  # Error log
        return False

# Add this function to calculate time-based analytics
def calculate_time_based_analytics(orders, period):
    """Calculate revenue and order analytics for different time periods."""
    from datetime import datetime, timedelta
    import pytz
    
    # Initialize result
    result = []
    
    # Define time periods and formatting
    if period == 'daily':
        days = 7  # Last 7 days
        date_format = '%b %d'  # e.g., "Jan 01"
    elif period == 'weekly':
        days = 28  # Last 4 weeks
        date_format = 'Week %W'  # e.g., "Week 01"
    elif period == 'monthly':
        days = 180  # Last 6 months
        date_format = '%b %Y'  # e.g., "Jan 2023"
    else:
        return []
        
    # Get current time and timezone
    now = datetime.now(pytz.UTC)
    
    # Create buckets based on period
    date_buckets = {}
    
    for i in range(days, -1, -1):
        if period == 'daily':
            date_key = (now - timedelta(days=i)).strftime(date_format)
            date_buckets[date_key] = {'revenue': 0, 'orders': 0, 'date': (now - timedelta(days=i)).isoformat()}
        elif period == 'weekly':
            # Group by week
            week_date = now - timedelta(days=i)
            week_key = week_date.strftime(date_format)
            if week_key not in date_buckets:
                date_buckets[week_key] = {'revenue': 0, 'orders': 0, 'date': week_date.isoformat()}
        elif period == 'monthly':
            # Group by month
            month_date = now - timedelta(days=i)
            month_key = month_date.strftime(date_format)
            if month_key not in date_buckets:
                date_buckets[month_key] = {'revenue': 0, 'orders': 0, 'date': month_date.isoformat()}
    
    # Process orders
    for order in orders:
        # Skip if no created_at timestamp
        if not order.get('created_at'):
            continue
        
        # Get order date and convert to datetime if it's a string
        order_date = order.get('created_at')
        if isinstance(order_date, str):
            try:
                order_date = datetime.fromisoformat(order_date.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                continue
        
        # Skip orders older than our period
        if (now - order_date).days > days:
            continue
            
        # Skip cancelled orders for revenue calculation
        is_cancelled = order.get('status') == 'cancelled'
            
        # Format date based on period
        if period == 'daily':
            date_key = order_date.strftime(date_format)
        elif period == 'weekly':
            date_key = order_date.strftime(date_format)
        elif period == 'monthly':
            date_key = order_date.strftime(date_format)
        else:
            continue
            
        # Add to appropriate bucket
        if date_key in date_buckets:
            # Add order count
            date_buckets[date_key]['orders'] += 1
            
            # Add revenue if not cancelled
            if not is_cancelled:
                date_buckets[date_key]['revenue'] += order.get('total', 0)
    
    # Convert buckets to list format for chart
    for date, data in date_buckets.items():
        result.append({
            'date': date,
            'value': data['revenue']  # Default to revenue
        })
    
    return result

# Add Product
@app.route('/add-product', methods=['POST'])
def add_product():
    name = request.form.get('name')
    price = request.form.get('price')
    category = request.form.get('category')  # Add this line
    availability = request.form.get('availability')
    image = request.files.get('image')

    if not name or not price or not availability or not category:  # Update validation
        return jsonify({"error": "All fields are required"}), 400

    # ImgBB upload
    image_url = None
    if image:
        try:
            # Create ImgBB API URL
            url = "https://api.imgbb.com/1/upload"
            
            # Read image file
            image_bytes = image.read()
            
            # Prepare the payload
            files = {
                'image': (image.filename, image_bytes, image.content_type)
            }
            payload = {'key': IMGBB_API_KEY}
            
            # Make the API request
            response = requests.post(url, files=files, data=payload)
            
            if response.status_code == 200:
                image_url = response.json()['data']['url']
            else:
                return jsonify({"error": f"Image upload failed: {response.text}"}), 500
                
        except Exception as e:
            return jsonify({"error": f"Error uploading image: {str(e)}"}), 500

    try:
        product_ref = db.collection("products").document(name)
        product_data = {
            "name": name,
            "price": float(price),
            "category": category,  # Add this line
            "availability": availability,
            "image_url": image_url
        }
        
        product_ref.set(product_data)

        return jsonify({
            "success": True,  # Add success flag
            "message": "Product added successfully",
            "product": {**product_data, "id": name}
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error saving product: {str(e)}"
        }), 500

# Update Product
@app.route('/update-product/<product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        # Get data from request.form
        name = request.form.get('name')
        price = request.form.get('price')
        category = request.form.get('category')
        availability = request.form.get('availability')
        image = request.files.get('image')

        if not all([name, price, availability]):
            return jsonify({
                "success": False,
                "message": "Missing required fields"
            }), 400

        product_ref = db.collection("products").document(product_id)
        
        # Check if product exists
        if not product_ref.get().exists:
            return jsonify({
                "success": False,
                "message": "Product not found"
            }), 404

        # Prepare update data
        update_data = {
            "name": name,
            "price": float(price),
            "category": category,
            "availability": availability
        }

        # Handle image upload if new image is provided
        if image:
            try:
                url = "https://api.imgbb.com/1/upload"
                image_bytes = image.read()
                files = {
                    'image': (image.filename, image_bytes, image.content_type)
                }
                payload = {'key': IMGBB_API_KEY}
                
                response = requests.post(url, files=files, data=payload)
                
                if response.status_code == 200:
                    update_data["image_url"] = response.json()['data']['url']
                else:
                    return jsonify({
                        "success": False,
                        "message": "Failed to upload image"
                    }), 500
            except Exception as e:
                return jsonify({
                    "success": False,
                    "message": f"Error uploading image: {str(e)}"
                }), 500

        # Update the product
        product_ref.update(update_data)

        return jsonify({
            "success": True,
            "message": "Product updated successfully",
            "product": {**update_data, "id": product_id}
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# Delete Product
@app.route('/delete-product/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    product_ref = db.collection("products").document(product_id)
    product_ref.delete()

    return jsonify({"message": "Product deleted successfully"}), 200

# Get All Products
@app.route('/get-products', methods=['GET'])
def get_products():
    try:
        products_ref = db.collection("products")
        products = products_ref.stream()

        product_list = []
        for product in products:
            product_data = product.to_dict()
            product_data["id"] = product.id
            product_list.append(product_data)

        return jsonify(product_list), 200
    except Exception as e:
        print(f"Error fetching products: {str(e)}")  # Add logging
        return jsonify([]), 200  # Return empty array instead of error

# Request Refund
@app.route('/request-refund', methods=['POST'])
def request_refund():
    data = request.json
    user_email = data.get('email')
    order_id = data.get('order_id')
    reason = data.get('reason')

    if not user_email or not order_id or not reason:
        return jsonify({"error": "All fields are required"}), 400

    refund_ref = db.collection("refunds").document()
    refund_ref.set({
        "user_email": user_email,
        "order_id": order_id,
        "reason": reason,
        "status": "pending"
    })

    return jsonify({"message": "Refund request submitted"}), 201

# Process Refund (Admin only)
@app.route('/process-refund/<refund_id>', methods=['PUT'])
def process_refund(refund_id):
    data = request.json
    status = data.get('status')

    if status not in ["approved", "rejected"]:
        return jsonify({"error": "Invalid status"}), 400

    refund_ref = db.collection("refunds").document(refund_id)
    refund_ref.update({"status": status})

    return jsonify({"message": "Refund processed successfully"}), 200



# ✅ SIGNUP Route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')  # Get the name from the request

    if not name:
        return jsonify({"error": "Name is required"}), 400

    is_valid, error_message = validate_input(email, password)
    if not is_valid:
        return jsonify({"error": error_message}), 400

    hashed_password = pbkdf2_sha256.hash(password)  # Secure password hashing

    user_ref = db.collection("users").document(email)
    if user_ref.get().exists:
        return jsonify({"error": "User already exists"}), 400

    # Save user details including name
    user_ref.set({
        "email": email,
        "password": hashed_password,
        "name": name,  # Store name in Firestore
        "wallet_balance": 50.00,  # Default wallet balance
        "created_at": firestore.SERVER_TIMESTAMP  # Add created_at field
    })

    return jsonify({"message": "User registered successfully"}), 201


# ✅ LOGIN Route
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        is_valid, error_message = validate_input(email, password)
        if not is_valid:
            return jsonify({"error": error_message}), 400

        user_ref = db.collection("users").document(email)
        user = user_ref.get()

        if not user.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user.to_dict()
        stored_password = user_data.get("password")

        if not pbkdf2_sha256.verify(password, stored_password):
            return jsonify({"error": "Invalid credentials"}), 401

        # Get role from user data, default to 'user' if not set
        role = user_data.get('role', 'user')

        # Fix the datetime usage here
        expiration = datetime.now(pytz.UTC) + timedelta(hours=24)
        
        # Create token with role
        token = jwt.encode(
            {
                "email": email,
                "role": role,
                "name": user_data.get('name'),
                "exp": expiration.timestamp()  # Convert to timestamp
            },
            SECRET_KEY,
            algorithm="HS256"
        )

        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "role": role,
            "name": user_data.get('name'),
            "email": email
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500

# Add a route to create canteen account (admin only)
@app.route('/create-canteen', methods=['POST'])
def create_canteen():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not all([email, password, name]):
        return jsonify({"error": "All fields are required"}), 400

    hashed_password = pbkdf2_sha256.hash(password)

    user_ref = db.collection("users").document(email)
    if user_ref.get().exists:
        return jsonify({"error": "User already exists"}), 400

    user_ref.set({
        "email": email,
        "password": hashed_password,
        "name": name,
        "role": "canteen",
        "created_at": firestore.SERVER_TIMESTAMP
    })

    return jsonify({"message": "Canteen account created successfully"}), 201

# ✅ FORGOT PASSWORD - Request Reset Token
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user_ref = db.collection("users").document(email)
    user = user_ref.get()

    if not user.exists:
        return jsonify({"error": "User not found"}), 404

    reset_token = generate_reset_token()
    user_ref.update({"reset_token": reset_token})

    # Simulating email sending (replace with real email service)
    print(f"Reset token for {email}: {reset_token}")

    return jsonify({"message": "Reset token sent to email"}), 200

# ✅ FORGOT PASSWORD - Reset Confirmation
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')
    reset_token = data.get('reset_token')

    if not email or not new_password or not reset_token:
        return jsonify({"error": "All fields are required"}), 400

    user_ref = db.collection("users").document(email)
    user = user_ref.get()

    if not user.exists:
        return jsonify({"error": "User not found"}), 404

    user_data = user.to_dict()
    stored_token = user_data.get("reset_token")

    if stored_token != reset_token:
        return jsonify({"error": "Invalid reset token"}), 401

    hashed_password = pbkdf2_sha256.hash(new_password)  # ✅ Securely hashing new password
    user_ref.update({"password": hashed_password, "reset_token": None})

    return jsonify({"message": "Password reset successfully"}), 200

# ✅ CHECK USER DETAILS
@app.route('/user', methods=['GET'])
def get_user():
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Token required"}), 401

        # Extract token from Bearer header
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header

        try:
            # Verify token
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            email = decoded.get("email")
            
            if not email:
                return jsonify({"error": "Invalid token format"}), 401

            # Get user document
            user_ref = db.collection("users").document(email)
            user_doc = user_ref.get()

            # Check if user exists (using exists as a property, not a method)
            if not user_doc.exists:
                return jsonify({"error": "User not found"}), 404

            user_data = user_doc.to_dict()
            
            return jsonify({
                "email": email,
                "name": user_data.get("name", "User"),
                "role": user_data.get("role", "user"),
                "wallet_balance": float(user_data.get("wallet_balance", 50.00))
            }), 200

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

    except Exception as e:
        print(f"Error in get_user: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Add a new route to get available food items
@app.route('/products/available', methods=['GET'])
def get_available_products():
    try:
        products_ref = db.collection("products")
        products = products_ref.where('availability', '==', 'available').stream()

        product_list = []
        for product in products:
            product_data = product.to_dict()
            product_data["id"] = product.id
            product_list.append(product_data)

        return jsonify({
            "success": True,
            "products": product_list
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/wallet/redeem', methods=['POST'])
def redeem_coupon():
    try:
        # Get and validate request data
        data = request.json
        voucher_code = data.get('voucher_code')
        user_email = data.get('user_email')
        
        print(f"Redeem attempt - Code: {voucher_code}, User: {user_email}")  # Debug log
        
        if not voucher_code or not user_email:
            return jsonify({
                "success": False,
                "message": "Missing coupon code or user email"
            }), 400

        # Get coupon document
        coupon_ref = db.collection('coupons').document(voucher_code)
        coupon_doc = coupon_ref.get()

        if not coupon_doc.exists:
            return jsonify({
                "success": False,
                "message": "Invalid coupon code"
            }), 404

        # Get coupon data and validate
        coupon_data = coupon_doc.to_dict()
        print(f"Coupon data: {coupon_data}")  # Debug log

        # Check if coupon is already used
        if coupon_data.get('is_used') is True:
            return jsonify({
                "success": False,
                "message": "Coupon already used"
            }), 400

        # Check expiry date
        try:
            expiry_date = datetime.strptime(coupon_data.get('expiry', ''), '%m/%d/%Y')
            current_date = datetime.now()
            if current_date > expiry_date:
                return jsonify({
                    "success": False,
                    "message": "Coupon has expired"
                }), 400
        except ValueError as e:
            print(f"Date parsing error: {str(e)}")
            return jsonify({
                "success": False,
                "message": "Invalid coupon expiry date"
            }), 400

        # Get user and update wallet
        user_ref = db.collection('users').document(user_email)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        user_data = user_doc.to_dict()
        current_balance = float(user_data.get('wallet_balance', 0))
        coupon_amount = float(coupon_data.get('amount', 0))
        new_balance = current_balance + coupon_amount

        # Use transaction to update both documents
        transaction = db.transaction()

        @firestore.transactional
        def update_wallet_and_coupon(transaction, user_ref, coupon_ref):
            # Update user's wallet balance
            transaction.update(user_ref, {
                'wallet_balance': new_balance
            })
            
            # Mark coupon as used
            transaction.update(coupon_ref, {
                'is_used': True,
                'used_by': user_email,
                'used_at': firestore.SERVER_TIMESTAMP
            })

        # Execute transaction
        try:
            update_wallet_and_coupon(transaction, user_ref, coupon_ref)
        except Exception as e:
            print(f"Transaction failed: {str(e)}")
            return jsonify({
                "success": False,
                "message": "Failed to process coupon"
            }), 500

        # Return success response
        return jsonify({
            "success": True,
            "message": "Coupon redeemed successfully",
            "new_balance": new_balance,
            "redeemed_amount": coupon_amount
        }), 200

    except Exception as e:
        print(f"Redemption error: {str(e)}")
        return jsonify({
            "success": False,
            "message": "An error occurred while processing your request"
        }), 500

# New endpoint: Generate coupon
@app.route('/coupons', methods=['POST'])
def generate_coupon():
    try:
        data = request.json
        code = data.get('code')
        amount = data.get('amount')
        expiry_days = data.get('expiry', 7)  # Default 7 days

        if not all([code, amount]):
            return jsonify({
                "success": False,
                "message": "Missing required fields"
            }), 400

        # Calculate expiry date properly
        current_time = datetime.now(pytz.UTC)
        expiry_date = current_time + timedelta(days=expiry_days)
        
        coupon_data = {
            "code": code,
            "amount": float(amount),
            "expiry": expiry_date.strftime('%m/%d/%Y'),  # Format date as string
            "created_at": current_time.isoformat(),  # Store as ISO format string
            "is_used": False,
            "used_by": None,
            "used_at": None
        }

        # Save to database
        coupon_ref = db.collection('coupons').document(code)
        
        # Check if coupon code already exists
        if coupon_ref.get().exists:
            return jsonify({
                "success": False,
                "message": "Coupon code already exists"
            }), 400

        coupon_ref.set(coupon_data)

        return jsonify({
            "success": True,
            "message": "Coupon generated successfully",
            "coupon": {
                "code": code,
                "amount": amount,
                "expiry": coupon_data["expiry"]
            }
        }), 201

    except Exception as e:
        print(f"Error generating coupon: {str(e)}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# New endpoint: Get all coupon generation history
@app.route('/coupons/history', methods=['GET'])
def coupon_history():
    try:
        coupons_ref = db.collection("coupons")
        coupons = coupons_ref.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        coupon_list = []
        for coupon in coupons:
            data = coupon.to_dict()
            data["code"] = coupon.id  # using document id as code
            coupon_list.append(data)
        return jsonify({"success": True, "coupons": coupon_list}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Reverted endpoint: Get redeemed coupon history for a user
@app.route('/coupons/user-history', methods=['GET'])
def user_coupon_history():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token required"}), 401
        # Revert to extracting email via jwt.decode directly
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_email = decoded.get("email")
        if not user_email:
            return jsonify({"success": False, "message": "Unable to extract user email from token"}), 400

        coupons_ref = db.collection("coupons").where("used_by", "==", user_email)\
            .order_by("used_at", direction=firestore.Query.DESCENDING).stream()
        used_coupons = []
        for coupon in coupons_ref:
            data = coupon.to_dict()
            data["code"] = coupon.id
            used_coupons.append(data)
        return jsonify({"success": True, "used_coupons": used_coupons}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# New route to get a single product
@app.route('/products/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product_ref = db.collection("products").document(product_id)
        product = product_ref.get()
        
        if not product.exists:
            return jsonify({"success": False, "message": "Product not found"}), 404
        
        product_data = product.to_dict()
        product_data['id'] = product.id
        
        return jsonify({
            "success": True,
            "product": product_data
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# Add new routes for orders
@app.route('/orders', methods=['POST'])
def create_order():
    try:
        data = request.json
        user_email = data.get('user_email')
        items = data.get('items', [])
        delivery_option = data.get('delivery_option', 'PICKUP')
        classroom = data.get('classroom', '')
        scheduled_time = data.get('scheduled_time', '')
        meal_timing = data.get('meal_timing', '')  # Add meal timing to order data
        
        if not user_email or not items:
            return jsonify({'error': 'Missing required fields'}), 400

        # Fetch complete product details for each item
        enriched_items = []
        for item in items:
            product_ref = db.collection('products').document(item['id'])
            product_data = product_ref.get().to_dict()
            enriched_items.append({
                'id': item['id'],
                'name': product_data.get('name', ''),
                'price': product_data.get('price', 0),
                'quantity': item['quantity'],
                'image_url': product_data.get('image_url', ''),  # Include image URL
                'category': product_data.get('category', '')
            })

        # Calculate total with delivery charge
        subtotal = sum(item['price'] * item['quantity'] for item in enriched_items)
        delivery_charge = DELIVERY_LOCATIONS[delivery_option]['charge']
        total = subtotal + delivery_charge

        # Check user wallet balance
        user_ref = db.collection('users').document(user_email)
        user_data = user_ref.get().to_dict()
        if user_data['wallet_balance'] < total:
            return jsonify({'error': 'Insufficient balance'}), 400

        # Create order with enriched items
        order_ref = db.collection('orders').document()
        order_data = {
            'user_email': user_email,
            'items': enriched_items,  # Use enriched items with image URLs
            'subtotal': subtotal,
            'delivery_charge': delivery_charge,
            'total': total,
            'status': ORDER_STATUS['PENDING'],
            'delivery_option': delivery_option,
            'classroom': classroom if delivery_option == 'CLASS' else '',
            'scheduled_time': scheduled_time,
            'created_at': firestore.SERVER_TIMESTAMP,
            'order_id': order_ref.id,
            'meal_timing': meal_timing,  # Add meal timing to order data
            'timing_slot': MEAL_TIMINGS.get(meal_timing, {})  # Add timing slot information
        }
        
        # Update user wallet and create order in transaction
        transaction = db.transaction()
        @firestore.transactional
        def create_order_transaction(transaction, user_ref, order_ref, order_data, user_data):
            new_balance = user_data['wallet_balance'] - total
            transaction.update(user_ref, {'wallet_balance': new_balance})
            transaction.set(order_ref, order_data)
            
        create_order_transaction(transaction, user_ref, order_ref, order_data, user_data)

        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'order_id': order_ref.id
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    try:
        data = request.json
        new_status = data.get('status')
        reason = data.get('reason', '')  # Optional reason for status change
        
        if not new_status:
            return jsonify({
                'ok': False,
                'message': 'Status is required'
            }), 400

        # Get order document
        order_ref = db.collection('orders').document(order_id)
        order = order_ref.get()
        
        if not order.exists:
            return jsonify({
                'ok': False,
                'message': 'Order not found'
            }), 404

        order_data = order.to_dict()
        user_email = order_data.get('user_email')

        # Handle status update in a transaction
        transaction = db.transaction()
        
        @firestore.transactional
        def update_order_in_transaction(transaction, order_ref):
            # Update order status
            transaction.update(order_ref, {
                'status': new_status,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status_reason': reason
            })
            
            # If cancelling order, process refund
            if new_status == 'cancelled':
                user_ref = db.collection('users').document(user_email)
                user_doc = user_ref.get(transaction=transaction)
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    current_balance = user_data.get('wallet_balance', 0)
                    refund_amount = order_data.get('total', 0)
                    
                    transaction.update(user_ref, {
                        'wallet_balance': current_balance + refund_amount
                    })
                    
                    transaction.update(order_ref, {
                        'refund_amount': refund_amount,
                        'refund_processed_at': firestore.SERVER_TIMESTAMP
                    })

        # Execute the transaction
        update_order_in_transaction(transaction, order_ref)

        # Create notification for user
        notification_message = {
            'ready': 'Your order is ready for pickup! 🍽️',
            'completed': 'Your order has been completed. Thank you for ordering from us! 🤗',
            'cancelled': 'Your order has been cancelled and refunded. 💰'
        }.get(new_status)

        if notification_message:
            create_notification(
                user_email=user_email,
                type=f'order_{new_status}',
                message=notification_message,
                order_id=order_id
            )

        return jsonify({
            'ok': True,
            'message': f'Order status updated to {new_status}'
        }), 200

    except Exception as e:
        print(f"Error updating order status: {str(e)}")
        return jsonify({
            'ok': False,
            'message': f'Error updating order status: {str(e)}'
        }), 500

@app.route('/orders/user/<user_email>', methods=['GET'])
def get_user_orders(user_email):
    try:
        orders = db.collection('orders')\
                  .where('user_email', '==', user_email)\
                  .order_by('created_at', direction=firestore.Query.DESCENDING)\
                  .stream()
        
        orders_list = []
        for order in orders:
            order_data = order.to_dict()
            order_data['id'] = order.id
            # Convert Firestore timestamp to string for JSON serialization
            if 'created_at' in order_data and order_data['created_at']:
                order_data['created_at'] = order_data['created_at'].isoformat()
            orders_list.append(order_data)
            
        return jsonify({
            'success': True,
            'orders': orders_list
        }), 200

    except Exception as e:
        print(f"Error in get_user_orders: {str(e)}")  # Add logging
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/orders/canteen', methods=['GET'])
def get_canteen_orders():
    try:
        # Get filter parameters
        status = request.args.get('status', '')
        date = request.args.get('date', '')
        
        # Query orders
        query = db.collection('orders')
        
        if status:
            query = query.where('status', '==', status)
        if date:
            # Convert date string to datetime
            start_date = datetime.strptime(date, '%Y-%m-%d')
            end_date = start_date + timedelta(days=1)
            query = query.where('created_at', '>=', start_date)\
                        .where('created_at', '<', end_date)
        
        orders = query.order_by('created_at', direction=firestore.Query.DESCENDING).stream()
        
        orders_list = []
        for order in orders:
            order_data = order.to_dict()
            order_data['id'] = order.id
            orders_list.append(order_data)
            
        return jsonify({
            'success': True,
            'orders': orders_list
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add more utility functions
def get_time_slots():
    """Generate available time slots for order scheduling"""
    current_time = datetime.now()
    slots = []
    
    # Generate slots for today and tomorrow
    for day_offset in range(2):
        date = current_time.date() + timedelta(days=day_offset)
        
        # If it's today, only show future slots
        start_hour = current_time.hour + 1 if day_offset == 0 else 8
        
        for hour in range(start_hour, 20):  # 8 AM to 8 PM
            slot_time = datetime.combine(date, datetime.min.time().replace(hour=hour))
            if slot_time > current_time:
                slots.append({
                    'value': slot_time.isoformat(),
                    'label': slot_time.strftime('%B %d, %I:00 %p')
                })
    
    return slots

@app.route('/utility/time-slots', methods=['GET'])
def available_time_slots():
    try:
        slots = get_time_slots()
        return jsonify({
            'success': True,
            'slots': slots
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/utility/delivery-locations', methods=['GET'])
def get_delivery_locations():
    return jsonify({
        'success': True,
        'locations': DELIVERY_LOCATIONS
    }), 200

@app.route('/utility/meal-timings', methods=['GET'])
def get_meal_timings():
    return jsonify({
        'success': True,
        'timings': MEAL_TIMINGS
    }), 200

# Add these new routes after your existing order routes

@app.route('/orders/<order_id>/cancel', methods=['POST'])
def cancel_order(order_id):
    try:
        # Get the order reference and snapshot
        order_ref = db.collection('orders').document(order_id)
        order_snapshot = order_ref.get()
        
        # Check if order exists (use exists property, not method)
        if not order_snapshot.exists:
            return jsonify({'success': False, 'error': 'Order not found'}), 404
            
        order_data = order_snapshot.to_dict()
        
        # Only allow cancellation of pending orders
        if order_data['status'] != 'pending':
            return jsonify({
                'success': False,
                'error': 'Can only cancel pending orders'
            }), 400
        
        # Calculate refund amount
        refund_amount = order_data['total']
        
        # Process refund in transaction
        transaction = db.transaction()
        user_ref = db.collection('users').document(order_data['user_email'])
        
        @firestore.transactional
        def cancel_order_transaction(transaction, order_ref, user_ref):
            # Get user data
            user_snapshot = user_ref.get(transaction=transaction)
            if not user_snapshot.exists:
                raise ValueError("User not found")
            
            user_data = user_snapshot.to_dict()
            
            # Update user wallet
            new_balance = user_data['wallet_balance'] + refund_amount
            transaction.update(user_ref, {'wallet_balance': new_balance})
            
            # Update order status
            transaction.update(order_ref, {
                'status': 'cancelled',
                'cancelled_at': firestore.SERVER_TIMESTAMP,
                'refund_amount': refund_amount
            })
        
        # Execute the transaction
        cancel_order_transaction(transaction, order_ref, user_ref)
        
        # Create notification for user
        create_notification(
            user_email=order_data['user_email'],
            type='order_cancelled',
            message='Your order has been cancelled and refunded. 💰',
            order_id=order_id
        )
        
        return jsonify({
            'success': True,
            'message': 'Order cancelled successfully'
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        print(f"Error cancelling order: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'An error occurred while cancelling the order'
        }), 500

@app.route('/wallet/transactions', methods=['GET'])
def get_wallet_transactions():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token required"}), 401

        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_email = decoded.get("email")

        transactions = []

        # Get user creation date and welcome bonus
        user_ref = db.collection("users").document(user_email)
        user_data = user_ref.get().to_dict()
        if user_data.get('created_at'):
            transactions.append({
                'id': f'welcome_{user_email}',
                'type': 'WELCOME_BONUS',
                'amount': 50.00,  # Welcome bonus amount
                'description': 'Welcome bonus credit',
                'timestamp': user_data.get('created_at'),
                'status': 'completed'
            })

        # Get order-related transactions
        orders = db.collection('orders')\
            .where('user_email', '==', user_email)\
            .order_by('created_at', direction=firestore.Query.DESCENDING)\
            .stream()

        # Add order transactions
        for order in orders:
            order_data = order.to_dict()
            
            # Add order payment
            transactions.append({
                'id': f'{order.id}_payment',
                'type': 'ORDER',
                'amount': -order_data.get('total', 0),
                'description': f"Payment for Order #{order.id[:8]} - {len(order_data.get('items', []))} items",
                'timestamp': order_data.get('created_at'),
                'status': order_data.get('status')
            })

            # Add refund if order was cancelled
            if order_data.get('status') == 'cancelled' and order_data.get('refund_amount'):
                transactions.append({
                    'id': f'{order.id}_refund',
                    'type': 'REFUND',
                    'amount': order_data.get('refund_amount', 0),
                    'description': f"Refund for Order #{order.id[:8]}",
                    'timestamp': order_data.get('cancelled_at'),
                    'status': 'completed'
                })

        # Get coupon redemptions
        coupons = db.collection('coupons')\
            .where('used_by', '==', user_email)\
            .order_by('used_at', direction=firestore.Query.DESCENDING)\
            .stream()

        # Add coupon transactions
        for coupon in coupons:
            coupon_data = coupon.to_dict()
            transactions.append({
                'id': coupon.id,
                'type': 'COUPON',
                'amount': coupon_data.get('amount', 0),
                'description': f"Coupon redeemed: {coupon.id}",
                'timestamp': coupon_data.get('used_at'),
                'status': 'completed'
            })

        # Sort all transactions by timestamp
        sorted_transactions = sorted(
            transactions, 
            key=lambda x: x['timestamp'] if x['timestamp'] else datetime.datetime.min, 
            reverse=True
        )

        # Convert timestamps to ISO format
        for transaction in sorted_transactions:
            if transaction['timestamp']:
                transaction['timestamp'] = transaction['timestamp'].isoformat()

        return jsonify({
            'success': True,
            'transactions': sorted_transactions
        }), 200

    except Exception as e:
        print(f"Error fetching wallet transactions: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Add new route for changing password
@app.route('/change-password', methods=['POST'])
def change_password():
    try:
        # Get and validate token
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"success": False, "message": "Token required"}), 401

        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        
        # Get request data
        data = request.json
        if not data:
            return jsonify({
                "success": False,
                "message": "No data provided"
            }), 400

        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({
                "success": False,
                "message": "Both current and new passwords are required"
            }), 400

        # Decode token and get user
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_email = decoded.get("email")
        
        if not user_email:
            return jsonify({
                "success": False,
                "message": "Invalid token format"
            }), 401

        # Get user from database
        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()
        
        # Check if user exists using the exists property
        if not user_doc.exists:  # Changed from exists to exists
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Verify current password
        user_data = user_doc.to_dict()
        stored_password = user_data.get("password")

        if not pbkdf2_sha256.verify(current_password, stored_password):
            return jsonify({
                "success": False,
                "message": "Current password is incorrect"
            }), 401

        # Hash and update new password
        hashed_password = pbkdf2_sha256.hash(new_password)
        user_ref.update({
            "password": hashed_password,
            "password_updated_at": firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            "success": True,
            "message": "Password updated successfully"
        }), 200

    except Exception as e:
        print(f"Password change error: {str(e)}")  # For debugging
        return jsonify({
            "success": False,
            "message": f"An error occurred while changing password: {str(e)}"
        }), 500

@app.route('/notifications', methods=['GET'])
def get_notifications():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token required"}), 401

        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_email = decoded.get("email")

        # Get notifications from Firestore with proper ordering
        notifications_ref = db.collection('notifications')\
            .where('user_email', '==', user_email)\
            .order_by('timestamp', direction=firestore.Query.DESCENDING)\
            .limit(50)
        
        notifications = []
        for doc in notifications_ref.stream():
            notification_data = doc.to_dict()
            # Convert timestamp to ISO format if it exists
            timestamp = notification_data.get('timestamp')
            if timestamp:
                timestamp = timestamp.isoformat()
                
            notifications.append({
                'id': doc.id,
                'type': notification_data.get('type'),
                'message': notification_data.get('message'),
                'timestamp': timestamp,
                'read': notification_data.get('read', False),
                'orderId': notification_data.get('order_id')
            })

        # Get unread count
        unread_count = len([n for n in notifications if not n['read']])

        return jsonify({
            'success': True,
            'notifications': notifications,
            'unread_count': unread_count
        }), 200

    except Exception as e:
        print(f"Error fetching notifications: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/notifications/<notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token required"}), 401

        notification_ref = db.collection('notifications').document(notification_id)
        notification_ref.update({
            'read': True,
            'read_at': firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)}
        ), 500

# Admin Routes
@app.route('/admin/dashboard', methods=['GET'])
def get_admin_dashboard():
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Token required"}), 401

        # Extract token from Bearer header
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header

        try:
            # Verify token
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            if decoded.get('role') != 'admin':
                return jsonify({"error": "Admin access required"}), 403

            # Get statistics
            users = db.collection('users').stream()
            canteens = db.collection('users').where('role', '==', 'canteen').stream()
            orders = db.collection('orders').stream()

            total_users = 0
            total_canteens = 0
            total_orders = 0
            total_revenue = 0
            cancelled_orders = 0
            total_refunded = 0

            # Process orders for detailed stats
            order_list = []
            for order in orders:
                order_data = order.to_dict()
                total_orders += 1
                
                if order_data.get('status') == 'cancelled':
                    cancelled_orders += 1
                    total_refunded += order_data.get('refund_amount', 0)
                elif order_data.get('status') != 'cancelled':
                    total_revenue += order_data.get('total', 0)
                
                # Add order to list for analytics
                order_list.append({
                    'created_at': order_data.get('created_at'),
                    'total': order_data.get('total', 0),
                    'status': order_data.get('status')
                })

            # Count users and canteens
            for _ in users:
                total_users += 1
            for _ in canteens:
                total_canteens += 1

            # Generate analytics
            daily_analytics = calculate_time_based_analytics(order_list, 'daily')
            weekly_analytics = calculate_time_based_analytics(order_list, 'weekly')
            monthly_analytics = calculate_time_based_analytics(order_list, 'monthly')

            return jsonify({
                'totalUsers': total_users,
                'totalCanteens': total_canteens,
                'totalOrders': total_orders,
                'totalRevenue': total_revenue,
                'cancelledOrders': cancelled_orders,
                'totalRefunded': total_refunded,
                'analytics': {
                    'daily': daily_analytics,
                    'weekly': weekly_analytics,
                    'monthly': monthly_analytics
                }
            }), 200

        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401

    except Exception as e:
        print(f"Error in admin dashboard: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add this new route for creating admin account
@app.route('/create-admin', methods=['POST'])
def create_admin():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not all([email, password, name]):
        return jsonify({"error": "All fields are required"}), 400

    hashed_password = pbkdf2_sha256.hash(password)

    user_ref = db.collection("users").document(email)
    if user_ref.get().exists:
        return jsonify({"error": "User already exists"}), 400

    user_ref.set({
        "email": email,
        "password": hashed_password,
        "name": name,
        "role": "admin",
        "created_at": firestore.SERVER_TIMESTAMP
    })

    return jsonify({"message": "Admin account created successfully"}), 201

# Add these new routes for admin canteen management
@app.route('/admin/canteens', methods=['GET'])
def get_canteens():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token required"}), 401

        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if decoded.get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403

        canteens = db.collection('users').where('role', '==', 'canteen').stream()
        canteen_list = []
        
        for canteen in canteens:
            data = canteen.to_dict()
            canteen_list.append({
                'id': canteen.id,
                'name': data.get('name'),
                'email': data.get('email'),
                'active': data.get('active', True),
                'created_at': data.get('created_at')
            })

        return jsonify({
            'success': True,
            'canteens': canteen_list
        }), 200

    except Exception as e:
        print(f"Error fetching canteens: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/admin/canteens/<canteen_id>', methods=['DELETE'])
def delete_canteen(canteen_id):
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token required"}), 401

        # Extract and verify token
        token = token.split(' ')[1] if token.startswith('Bearer ') else token
        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            if decoded.get('role') != 'admin':
                return jsonify({"error": "Admin access required"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        # Get admin's password for confirmation
        data = request.json
        admin_password = data.get('password')
        
        # Verify admin's password
        admin_ref = db.collection('users').document(decoded.get('email'))
        admin_data = admin_ref.get().to_dict()
        if not pbkdf2_sha256.verify(admin_password, admin_data.get('password')):
            return jsonify({"error": "Invalid admin password"}), 401

        # Get canteen data and verify it exists
        canteen_ref = db.collection('users').document(canteen_id)
        canteen_data = canteen_ref.get()
        
        if not canteen_data.exists:
            return jsonify({"error": "Canteen not found"}), 404
            
        canteen_data = canteen_data.to_dict()
        if canteen_data.get('role') != 'canteen':
            return jsonify({"error": "Can only delete canteen accounts"}), 403

        # Delete the canteen
        canteen_ref.delete()

        return jsonify({
            'success': True,
            'message': 'Canteen deleted successfully'
        }), 200

    except Exception as e:
        print(f"Error deleting canteen: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Update the create-canteen route to check for admin privileges
@app.route('/admin/canteens', methods=['POST'])
def admin_create_canteen():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token required"}), 401

        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if decoded.get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403

        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not all([email, password, name]):
            return jsonify({"error": "All fields are required"}), 400

        # Check if user already exists
        user_ref = db.collection('users').document(email)
        if user_ref.get().exists:
            return jsonify({"error": "User already exists"}), 400

        # Create new canteen user
        hashed_password = pbkdf2_sha256.hash(password)
        user_ref.set({
            "email": email,
            "password": hashed_password,
            "name": name,
            "role": "canteen",
            "active": True,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            "success": True,
            "message": "Canteen created successfully"
        }), 201

    except Exception as e:
        print(f"Error creating canteen: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add these new routes for admin user management
@app.route('/admin/users', methods=['GET'])
def get_users():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token required"}), 401

        # Fix the syntax error in jwt.decode and if statement
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if decoded.get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403

        users = db.collection('users').stream()
        user_list = []
        
        for user in users:
            data = user.to_dict()
            user_data = {
                'email': user.id,
                'name': data.get('name', 'N/A'),
                'role': data.get('role', 'user'),
                'wallet_balance': float(data.get('wallet_balance', 0)),
                'created_at': data.get('created_at')
            }
            user_list.append(user_data)

        return jsonify({
            'success': True,
            'users': user_list
        }), 200

    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/admin/users/<user_id>/balance', methods=['POST'])
def update_user_balance(user_id):
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token required"}), 401

        # Fix the syntax error in jwt.decode
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if decoded.get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403

        data = request.json
        amount = float(data.get('amount', 0))

        user_ref = db.collection('users').document(user_id)
        user = user_ref.get()

        if not user.exists:
            return jsonify({"error": "User not found"}), 404

        current_balance = user.to_dict().get('wallet_balance', 0)
        new_balance = current_balance + amount

        user_ref.update({
            'wallet_balance': new_balance
        })

        # Create transaction record
        transaction_ref = db.collection('transactions').document()
        transaction_ref.set({
            'user_email': user_id,
            'amount': amount,
            'type': 'ADMIN_CREDIT',
            'timestamp': firestore.SERVER_TIMESTAMP,
            'description': f'Admin added ₹{amount}'
        })

        return jsonify({
            'success': True,
            'message': 'Balance updated successfully',
            'new_balance': new_balance
        }), 200

    except Exception as e:
        print(f"Error updating balance: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add this new route for deleting users (admin only)
@app.route('/admin/users/<user_id>/delete', methods=['DELETE'])
def delete_user(user_id):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Token required"}), 401

        # Extract and verify token
        token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
        try:
            # Fix the syntax error in jwt.decode
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            if decoded.get('role') != 'admin':
                return jsonify({"error": "Admin access required"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        # Get admin's password for confirmation
        data = request.json
        admin_password = data.get('password')
        
        # Verify admin's password
        admin_ref = db.collection('users').document(decoded.get('email'))
        admin_data = admin_ref.get().to_dict()
        if not pbkdf2_sha256.verify(admin_password, admin_data.get('password')):
            return jsonify({"error": "Invalid admin password"}), 401

        # Check if trying to delete an admin
        user_ref = db.collection('users').document(user_id)
        user_data = user_ref.get().to_dict()
        if user_data.get('role') == 'admin':
            return jsonify({"error": "Cannot delete admin users"}), 403

        # Delete the user
        user_ref.delete()

        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200

    except Exception as e:
        print(f"Error deleting user: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add after other product-related routes
@app.route('/products/<product_id>/analytics', methods=['GET'])
def get_product_analytics(product_id):
    try:
        # Get all orders that contain this product
        orders = db.collection('orders').stream()
        
        # Initialize data structure for last 7 days with timezone awareness
        today = datetime.now(pytz.UTC)
        sales_data = {
            (today - timedelta(days=i)).strftime('%a'): 0 
            for i in range(7)
        }
        total_sold = 0
        
        # Process orders
        for order in orders:
            order_data = order.to_dict()
            
            # Skip cancelled orders
            if order_data.get('status') == 'cancelled':
                continue
                
            # Handle order date with proper timezone
            order_date = order_data.get('created_at')
            if not order_date:
                continue
                
            # Convert string date to datetime if needed
            if isinstance(order_date, str):
                try:
                    # Parse ISO format string to timezone-aware datetime
                    order_date = datetime.fromisoformat(order_date.replace('Z', '+00:00')).replace(tzinfo=pytz.UTC)
                except ValueError:
                    continue
            # Convert Firestore timestamp to datetime if needed
            elif hasattr(order_date, 'timestamp'):
                # Firestore timestamp is already UTC
                order_date = datetime.fromtimestamp(order_date.timestamp(), pytz.UTC)
                
            # Ensure order_date is timezone-aware
            if order_date.tzinfo is None:
                order_date = pytz.UTC.localize(order_date)
                
            # Check if order is within last 7 days
            if (today - order_date).days > 7:
                continue
            
            # Process order items
            for item in order_data.get('items', []):
                if item.get('id') == product_id:
                    day_key = order_date.strftime('%a')
                    sales_data[day_key] += item.get('quantity', 0)
                    total_sold += item.get('quantity', 0)
        
        # Convert to arrays for frontend
        dates = list(sales_data.keys())
        sales = list(sales_data.values())
        
        return jsonify({
            'success': True,
            'sales_data': sales,
            'dates': dates,
            'total_sold': total_sold
        }), 200
        
    except Exception as e:
        print(f"Error getting product analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/user/update', methods=['PUT'])
def update_user_profile():
    try:
        # Get and validate token
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token required"}), 401

        # Extract token and decode
        token = token.split(' ')[1] if token.startswith('Bearer ') else token
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_email = decoded.get("email")

        if not user_email:
            return jsonify({
                "success": False,
                "message": "Invalid token"
            }), 401

        # Get request data
        data = request.json
        name = data.get('name')

        if not name:
            return jsonify({
                "success": False,
                "message": "Name is required"
            }), 400

        # Get user document
        user_ref = db.collection("users").document(user_email)
        user_doc = user_ref.get()

        # Check if user exists using the exists property
        if not user_doc.exists:  # Changed from exists() to exists
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Update user's name
        user_ref.update({
            "name": name,
            "updated_at": firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "name": name
        }), 200

    except Exception as e:
        print(f"Error updating profile: {str(e)}")  # For debugging
        return jsonify({
            "success": False,
            "message": f"An error occurred while updating profile: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
