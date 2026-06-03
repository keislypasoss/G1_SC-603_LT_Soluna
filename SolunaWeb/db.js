const sql = require('mssql');

// Configuración adaptable: usa variables de entorno en producción (Azure)
// y cae a la configuración local por defecto si no existen.
const isAzure = !!process.env.DB_SERVER;

const config = isAzure ? {
    server: process.env.DB_SERVER, // ej: 'solunadbserver.database.windows.net'
    database: process.env.DB_DATABASE || 'SolunaDB',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: true, // Requerido para Azure SQL Database
        trustServerCertificate: false, // Usar certificados válidos de Azure
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
} : {
    // Mantener compatibilidad local con driver nativo de Windows si no hay env vars
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=Je-PC;Database=SolunaDB;Trusted_Connection=yes;'
};

async function getConnection() {
    try {
        // En Azure usamos la config basada en objetos, en local la connectionString nativa
        const dbConfig = isAzure ? config : {
            connectionString: config.connectionString,
            driver: 'msnodesqlv8'
        };

        // El paquete 'mssql' resolverá la conexión apropiadamente
        const pool = await sql.connect(dbConfig);
        console.log(`Connected to SQL Server successfully (${isAzure ? 'Azure Cloud' : 'Local machine'})`);
        return pool;
    } catch (err) {
        console.error('Database Connection Failed! Bad Config: ', err);
        throw err;
    }
}

module.exports = {
    getConnection,
    sql
};
