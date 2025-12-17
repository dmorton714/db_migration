import pandas as pd
import sqlite3


def insert_crime_data_to_sqlite(data: pd.DataFrame, db_path: str):
    """
    Inserts a cleaned crime DataFrame into a SQLite database, splitting it into 4 tables:
    Address, CaseInfo, Demographics, and Geo.

    Parameters:
    -----------
    data : pd.DataFrame
        Cleaned DataFrame with all necessary columns.
        Must include 'ObjectId'.
    db_path : str
        Path to SQLite database file.
    """
    # Connect to SQLite
    conn = sqlite3.connect(db_path)

    try:
        # Insert Address table
        address_cols = ['Address', 'Neighborhood', 'ZIP_Code']
        data[['ObjectId'] + address_cols].to_sql(
            'Address',
            conn,
            if_exists='replace',
            index=False
        )

        # Insert CaseInfo table
        caseinfo_cols = ['Date', 'Case_Number', 'Division_Name', 'Council_District', 'Crime_Type', 'Cause']
        data[['ObjectId'] + caseinfo_cols].to_sql(
            'CaseInfo',
            conn,
            if_exists='replace',
            index=False
        )

        # Insert Demographics table
        demo_cols = ['Age_Group', 'Sex', 'Race']
        data[['ObjectId'] + demo_cols].to_sql(
            'Demographics',
            conn,
            if_exists='replace',
            index=False
        )

        # Insert Geo table
        geo_cols = ['Latitude', 'Longitude']
        data[['ObjectId'] + geo_cols].to_sql(
            'Geo',
            conn,
            if_exists='replace',
            index=False
        )

        print(f"Data successfully inserted into SQLite database at: {db_path}")

    finally:
        # Close connection
        conn.close()


if __name__ == "__main__":
    # Example usage
    raw_data = pd.read_csv('data/shootings.csv')
    from prepData import prepare_crime_data
    cleaned_data = prepare_crime_data(raw_data)
    db_path = 'database/crime_data.db'
    insert_crime_data_to_sqlite(cleaned_data, db_path)