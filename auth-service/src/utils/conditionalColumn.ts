import { ColumnOptions } from 'typeorm';

// Helper function to conditionally set column types based on the database type
export function conditionalColumn(columnOptions: Partial<ColumnOptions>) {
  return {
    ...columnOptions,
    type: process.env.DATABASE_TYPE === 'h2' ? 'varchar' : columnOptions.type,
  };
}