import firebase_admin
from firebase_admin import credentials, firestore
import getpass
from passlib.hash import pbkdf2_sha256
import os
from dotenv import load_dotenv

def reset_admin_password():
    try:
        # Load environment variables
        load_dotenv()
        
        # Initialize Firebase
        firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS")
        if not firebase_cred_path:
            raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")
            
        cred = credentials.Certificate(firebase_cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()

        # Find admin user
        users_ref = db.collection("users")
        admin_query = users_ref.where('role', '==', 'admin').limit(1).stream()
        admin_user = next(admin_query, None)
        
        if not admin_user:
            print("\nError: No admin user found in the system")
            return
            
        admin_data = admin_user.to_dict()
        admin_email = admin_user.id
        
        print("\n=== Admin Password Reset Tool ===")
        print(f"\nResetting password for admin: {admin_email}")

        # Get new password (with confirmation)
        while True:
            new_password = getpass.getpass("\nEnter new password (min 8 characters): ")
            if len(new_password) < 8:
                print("Password must be at least 8 characters long")
                continue
                
            confirm_password = getpass.getpass("Confirm new password: ")
            if new_password != confirm_password:
                print("Passwords do not match")
                continue
            
            break

        # Hash and update password
        hashed_password = pbkdf2_sha256.hash(new_password)
        users_ref.document(admin_email).update({
            "password": hashed_password,
            "password_updated_at": firestore.SERVER_TIMESTAMP
        })

        print("\nSuccess: Admin password has been reset")
        print(f"Email: {admin_email}")
        print("Please login with your new password")

    except Exception as e:
        print(f"\nError: {str(e)}")
    finally:
        # Clean up Firebase app
        if firebase_admin._apps:
            firebase_admin.delete_app(firebase_admin.get_app())

if __name__ == "__main__":
    reset_admin_password()
