# Data ETL 

This project is a **ETL pipeline** for processing, cleaning, and storing Louisville shooting data. The portion takes raw data from a API, and will clean and normalize it, and insert it into a SQLite database for analysis, visualization, or API use.

## Project Structure

The project is organized into modular Python scripts:

### 1. `apiCall.py`
- Handles **data ingestion**.
- Can read CSV files or connect to external APIs.
- Returns a pandas DataFrame with raw crime data.

**Example function:**
```python
from apiCall import fetch_crime_data

raw_data = fetch_crime_data('raw_crime_data.csv')
```

### 2. `prepData.py`

Handles data cleaning and preparation.

Converts timestamps to datetime, normalizes date formats, and extracts a Date column.

Converts numeric columns and ensures ZIP codes are strings.

Cleans text columns (strips whitespace, title-cases) and fills missing demographic data.

Prepares data for insertion into SQLite.

Example function:

```python
from prepData import prepare_crime_data

clean_data = prepare_crime_data(raw_data)
```

### 3. `dbBuilder.py`
---

Handles SQLite database creation and table insertion.
Splits the prepared DataFrame into 4 tables:

- Address – ObjectId, Address, Neighborhood, ZIP_Code
- CaseInfo – ObjectId, Date, Case_Number, Division_Name, Council_District, Crime_Type, Cause
- Demographics – ObjectId, Age_Group, Sex, Race
- Geo – ObjectId, Latitude, Longitude

Each table uses ObjectId as the primary key, enabling easy JOIN operations.

Example function:
```python
from dbBuilder import insert_crime_data_to_sqlite

db_path = '../../database/crime_data.db'
insert_crime_data_to_sqlite(clean_data, db_path)
```

### Workflow
---

1. Fetch raw data using apiCall.py.
2. Clean and prepare data with prepData.py.
3. Insert into SQLite with dbBuilder.py.
4. The database is ready for queries, analytics, and visualization.

**Notebook Usage Example:**

```python
from apiCall import fetch_crime_data
from prepData import prepare_crime_data
from dbBuilder import insert_crime_data_to_sqlite

# Step 1: Load raw data
raw_data = fetch_crime_data('raw_crime_data.csv')

# Step 2: Clean / prepare
clean_data = prepare_crime_data(raw_data)

# Step 3: Insert into SQLite
db_path = '../../database/crime_data.db'
insert_crime_data_to_sqlite(clean_data, db_path)
```

### Project Notes
---

- ObjectId is used as the unique identifier across all tables to maintain 1:1 relationships.
- DateTime is normalized and stored in SQLite as a TEXT field in 'YYYY-MM-DD HH:MM:SS' format.
- Text fields are cleaned (stripped and title-cased) and missing demographic values are set to 'Unknown'.
- Modular structure allows future expansion:
- Multiple API sources
- Additional tables or relationships
- API endpoints or analytics dashboards

### Dependencies
---
- Python 3.9+
- pandas
- sqlite3 (built-in)


---

| Concept                                         | Explanation in Your Context                                                                                             |
| :------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------ |
| **Data Lake**                          | The raw CSVs or API endpoints from Louisville crime data. This is the “Data Lake”.                                               |
| **Ingestion**                          | Using `apiCall.py` to fetch or read raw data.                                                                                    |
| **ETL (Extract, Transform, Load)**     | `prepData.py` does the **Transform** step: formatting dates, normalizing text, handling nulls.                                   |
| **Database / Warehousing**             | `dbBuilder.py` inserts the cleaned data into SQLite. This is the **Load** step.                                                  |
| **Primary Key**                        | `ObjectId` ensures each record can be uniquely identified and joined across tables.                                              |
| **Foreign Key Relationships**          | In your current design, you could add FK constraints to enforce joins, though SQLite doesn’t enforce them strictly by default.   |
| **Pipeline / ETL Pipeline**            | The sequential process: ingestion → preparation → insertion.                                                                     |
| **Consumption / Downstream Analytics** | After the ETL pipeline, you can query the SQLite database for charts, stats, and APIs.                                           |



```markdown
+----------------+          +----------------+          +----------------+
|    Address     |          |    CaseInfo    |          |  Demographics  |
|----------------|          |----------------|          |----------------|
| ObjectId (PK)  | <--+---> | ObjectId (PK)  | <---+--> | ObjectId (PK)  |
| Address        |    |     | Date           |     |    | Age_Group      |
| Neighborhood   |    |     | Case_Number    |     |    | Sex            |
| ZIP_Code       |    |     | Division_Name  |     |    | Race           |
+----------------+    |     | Council_District|    |    +----------------+
                      |     | Crime_Type     |     |
                      |     | Cause          |     |
                      |     +----------------+     |
                      |                            |
                      |                            |
                      |                            |
                      |     +----------------+     |
                      |     |      Geo       |     |
                      |     |----------------|     |
                      +-----| ObjectId (PK)  |-----+
                            | Latitude       |
                            | Longitude      |
                            +----------------+
```