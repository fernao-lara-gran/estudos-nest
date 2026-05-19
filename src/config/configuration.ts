export interface AppConfiguration {
  port: number;
  mysql: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  dynamodb: {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Defina ${name} no .env (ver .env.example).`);
  }
  return value;
}

const skipInfra = process.env.SKIP_INFRA === '1';

export default (): AppConfiguration => {
  if (skipInfra) {
    return {
      port: Number(process.env.PORT ?? 3000),
      mysql: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'root',
        database: 'nest_fastify',
      },
      dynamodb: {
        endpoint: 'http://127.0.0.1:8000',
        region: 'us-east-1',
        accessKeyId: 'local',
        secretAccessKey: 'local',
      },
    };
  }

  return {
  port: Number(process.env.PORT ?? 3000),
  mysql: {
    host: requireEnv('MYSQL_HOST'),
    port: Number(requireEnv('MYSQL_PORT')),
    user: requireEnv('MYSQL_USER'),
    password: requireEnv('MYSQL_PASSWORD'),
    database: requireEnv('MYSQL_DATABASE'),
  },
  dynamodb: {
    endpoint: requireEnv('DYNAMODB_ENDPOINT'),
    region: requireEnv('AWS_REGION'),
    accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
  },
};
};
