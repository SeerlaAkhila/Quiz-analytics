Full-Stack Adaptive Learning Quiz App
This is a full-stack web application that provides a personalized quiz experience. It uses an adaptive algorithm to adjust the difficulty of questions based on the user's performance, creating a dynamic learning path.

Tech Stack
Backend: Flask (Python)

Frontend: HTML, CSS, Vanilla JavaScript

Database: SQLite

Project Structure
/adaptive-quiz-app
|-- /instance
|   |-- quiz.db           # Database file (auto-generated)
|-- /static
|   |-- /css
|   |   |-- style.css     # All custom styles
|   |-- /js
|   |   |-- script.js     # Frontend application logic
|-- /templates
|   |-- index.html        # Main HTML file for the single-page app
|-- app.py                # Core Flask application
|-- database.py           # Database connection and initialization script
|-- schema.sql            # SQL schema and sample data
|-- README.md             # This file

Setup and Installation
Prerequisites
Python 3.6+

pip for package management

1. Clone the Repository
Clone this repository to your local machine or create the file structure as described above and add the code to each file.

2. Set up the Python Environment
It is highly recommended to use a virtual environment to manage project dependencies.

# Navigate to your project directory
cd path/to/adaptive-quiz-app

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

3. Install Dependencies
The only external package required is Flask.

pip install Flask

4. Initialize the Database
Run the following command from your terminal in the project's root directory. This command will execute the schema.sql script to create the quiz.db file and populate it with tables and sample questions.

flask --app database init-db

After running this, you should see a new folder named instance appear in your project directory, containing the quiz.db file.

5. Run the Application
Start the Flask development server with the following command:

flask --app app run

The application will now be running. Open your web browser and navigate to:

http://127.0.0.1:5000

You should see the adaptive quiz application ready to use!