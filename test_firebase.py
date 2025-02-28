import firebase_admin
from firebase_admin import credentials, firestore
import os

def test_firebase_connection():
    try:
        # Initialize Firebase
        cred = credentials.Certificate('firebase_credentials.json')
        firebase_admin.initialize_app(cred)
        
        # Get Firestore client
        db = firestore.client()
        
        # Try a simple query
        users = db.collection('users').limit(1).stream()
        for user in users:
            print(f"Successfully connected! Found user: {user.id}")
            break
            
        return True
    except Exception as e:
        print(f"Firebase connection error: {str(e)}")
        return False

if __name__ == "__main__":
    test_firebase_connection()
