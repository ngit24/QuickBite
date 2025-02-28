import os
import re

def replace_url_in_file(file_path, old_url, new_url):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            file_content = file.read()

        # Check if the old URL exists in the file
        if re.search(re.escape(old_url), file_content):
            # Replace the old URL with the new URL
            new_content = re.sub(re.escape(old_url), new_url, file_content)

            # Write the modified content back to the file
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(new_content)

            print(f"Changed: {file_path}")  # Print only if the file was changed
            return True  # Indicate that the file was changed
        else:
            return False  # Indicate that the file was not changed

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def replace_url_in_folder(folder_path, old_url, new_url):
    changed_files = 0
    for root, dirs, files in os.walk(folder_path):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            if replace_url_in_file(file_path, old_url, new_url):
                changed_files += 1

    print(f"Total files changed: {changed_files}")

if __name__ == "__main__":
    # Get the directory where the script is located
    script_directory = os.path.dirname(os.path.abspath(__file__))
    
    old_url = "https://localhost969.pythonanywhere.com"
    new_url = "https://localhost969.pythonanywhere.com"

    print(f"Starting URL replacement in folder: {script_directory}")
    replace_url_in_folder(script_directory, old_url, new_url)
    print("URL replacement completed.")