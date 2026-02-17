from apiCall import fetch_gun_violence_data
from prepData import prepare_crime_data
from dbBuilder import insert_crime_data_to_sqlite


def run_full_pipeline(csv_dir='data',
                      csv_file='shootings.csv',
                      db_path='database/crime_data.db'):
    """
    Full ETL pipeline: fetch raw data, clean it, and insert into SQLite database.
    """
    print("STEP 1: Extract")
    raw_data = fetch_gun_violence_data(output_dir=csv_dir, output_file=csv_file)

    if raw_data.empty:
        print("No data to process. Exiting pipeline.")
        return

    print("STEP 2: Transform")
    clean_data = prepare_crime_data(raw_data)

    print("STEP 3: Load")
    insert_crime_data_to_sqlite(clean_data, db_path)

    print("Pipeline complete!")


if __name__ == "__main__":
    run_full_pipeline()
