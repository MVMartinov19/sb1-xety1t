/// <reference types="vite/client" />

declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: typeof Database;
  }
  
  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string, params?: any[]): Array<{columns: string[], values: any[][]}>;
    close(): void;
  }
  
  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}