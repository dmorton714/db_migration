import pandas as pd


def prepare_crime_data(data: pd.DataFrame) -> pd.DataFrame:
    """
    Prepares and cleans the crime dataset for analysis or database insertion.

    Parameters:
    -----------
    data : pd.DataFrame
        Raw crime data with columns like 'DateTime', 'ZIP_Code', 'Council_District', etc.

    Returns:
    --------
    pd.DataFrame
        Cleaned and prepared DataFrame with:
        - 'DateTime' normalized and formatted
        - 'Date' column extracted
        - Numeric columns cast correctly
        - Text columns stripped, title-cased, and missing values filled
    """

    # Convert DateTime from milliseconds, normalize and format
    data['DateTime'] = pd.to_datetime(
        data['DateTime'], unit='ms').dt.normalize()
    data['DateTime'] = data['DateTime'].dt.strftime('%Y-%m-%d %H:%M:%S')

    # Extract just the date
    data['Date'] = data['DateTime'].str[:10]

    # Convert Council_District to nullable integer
    data['Council_District'] = data['Council_District'].astype('Int64')

    # Ensure ZIP_Code is string
    data['ZIP_Code'] = data['ZIP_Code'].astype(str)

    # Columns to clean text
    text_cols = ['Neighborhood', 'Crime_Type', 'Cause',
                 'Sex', 'Race', 'Age_Group', 'Division_Name']
    for col in text_cols:
        data[col] = data[col].astype(str).str.strip().str.title()

    # Fill missing demographic data
    demo_cols = ['Cause', 'Sex', 'Race', 'Age_Group']
    data[demo_cols] = data[demo_cols].fillna('Unknown')

    return data


if __name__ == "__main__":

    # Example usage
    raw_data = pd.read_csv('data/shootings.csv')
    cleaned_data = prepare_crime_data(raw_data)
    print(cleaned_data.head())
