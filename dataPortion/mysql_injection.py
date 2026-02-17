import pandas as pd
from sqlalchemy import create_engine, text


DB_URL = "mysql+mysqlconnector://dbuser:dbpassword@127.0.0.1:3306/shooting_db"


def load_dataframe_to_mysql(data: pd.DataFrame):
    """
    Truncates tables and reloads shooting dataframe into MySQL.
    """

    engine = create_engine(DB_URL)

    with engine.begin() as conn:

        print("Connected. Disabling foreign key checks...")
        conn.execute(text("SET FOREIGN_KEY_CHECKS=0;"))

        print("Clearing tables...")

        conn.execute(text("DELETE FROM Geo;"))
        conn.execute(text("DELETE FROM Demographics;"))
        conn.execute(text("DELETE FROM CaseInfo;"))
        conn.execute(text("DELETE FROM Address;"))

        print("Loading Address...")
        addr_cols = ['ObjectId', 'Address', 'Neighborhood', 'ZIP_Code']
        data[addr_cols].to_sql(
            'Address',
            conn,
            if_exists='append',
            index=False,
            method='multi'
        )

        print("Loading CaseInfo...")
        case_cols = [
            'ObjectId', 'Date', 'Case_Number', 'Division_Name',
            'Council_District', 'Crime_Type', 'Cause'
        ]
        data[case_cols].to_sql(
            'CaseInfo',
            conn,
            if_exists='append',
            index=False,
            method='multi'
        )

        print("Loading Demographics...")
        demo_cols = ['ObjectId', 'Age_Group', 'Sex', 'Race']
        data[demo_cols].to_sql(
            'Demographics',
            conn,
            if_exists='append',
            index=False,
            method='multi'
        )

        print("Loading Geo...")
        geo_cols = ['ObjectId', 'Latitude', 'Longitude']
        data[geo_cols].to_sql(
            'Geo',
            conn,
            if_exists='append',
            index=False,
            method='multi'
        )

        print("Re-enabling foreign key checks...")
        conn.execute(text("SET FOREIGN_KEY_CHECKS=1;"))

    print("All tables replaced successfully.")


def main():
    """
    Entry point for ETL pipeline.
    Replace CSV path with your source.
    """

    print("Reading source data...")

    data = pd.read_csv("shootings.csv")

    load_dataframe_to_mysql(data)


if __name__ == "__main__":
    main()
