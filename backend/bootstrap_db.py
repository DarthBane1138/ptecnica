import os

import psycopg


APP_TABLES = (
    "api_category",
    "api_task",
)


def quote_ident(value: str) -> str:
    return '"' + value.replace('"', '""') + '"'


def main() -> None:
    schema = os.getenv("POSTGRES_SCHEMA", "public").strip() or "public"

    connection = psycopg.connect(
        dbname=os.getenv("POSTGRES_DB", "postgres"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "postgres"),
        host=os.getenv("POSTGRES_HOST", "db"),
        port=os.getenv("POSTGRES_PORT", "5432"),
        autocommit=True,
    )

    with connection, connection.cursor() as cursor:
        cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {quote_ident(schema)}")

        if schema != "public":
            for table_name in APP_TABLES:
                cursor.execute(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = 'public' AND table_name = %s
                    ),
                    EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = %s AND table_name = %s
                    )
                    """,
                    (table_name, schema, table_name),
                )
                public_exists, target_exists = cursor.fetchone()
                if public_exists and not target_exists:
                    cursor.execute(
                        f"ALTER TABLE public.{quote_ident(table_name)} "
                        f"SET SCHEMA {quote_ident(schema)}"
                    )


if __name__ == "__main__":
    main()
