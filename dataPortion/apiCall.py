import pandas as pd
import os
import requests

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def fetch_gun_violence_data(
    output_dir=None,
    output_file='shootings.csv',
    batch_size=1000
):
    if output_dir is None:
        output_dir = os.path.join(BASE_DIR, 'data')

    url = 'https://services1.arcgis.com/79kfd2K6fskCAkyg/arcgis/rest/services/Gun_Violence_Data/FeatureServer/0/query'

    offset = 0
    data_list = []

    params = {
        'where': '1=1',
        'outFields': '*',
        'returnGeometry': 'false',
        'f': 'json',
        'resultOffset': offset,
        'resultRecordCount': batch_size
    }

    while True:
        params['resultOffset'] = offset
        response = requests.get(url, params=params)
        print(f"Requesting URL: {response.url}")

        if response.status_code != 200:
            break

        try:
            query_result = response.json()
        except ValueError:
            break

        features = query_result.get('features', [])
        if not features:
            break

        data_list.extend(feature['attributes'] for feature in features)

        if len(features) < batch_size:
            break

        offset += batch_size

    if not data_list:
        print("No data retrieved.")
        return pd.DataFrame()

    df = pd.DataFrame(data_list)
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, output_file)
    df.to_csv(output_path, index=False)

    print(f"Data saved to {output_path}")
    return df


if __name__ == "__main__":
    # Example usage
    fetch_gun_violence_data()