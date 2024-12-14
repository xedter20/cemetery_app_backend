import { NestFactory } from '@nestjs/core';
import { CemeteryModule } from './cemetery.module';
import { LoggingInterceptor } from './config/logger/core-logging.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AdminInsertService } from './service/admin-insert.service';
import * as express from 'express'; // Import express
import { ExpressAdapter } from '@nestjs/platform-express';
import * as sqlite3 from 'sqlite3'; // Correct import for sqlite3
import { error } from 'console';
// Load environment variables from .env
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as cors from 'cors';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';
import { Permission } from './model/permission.entity';
import { PrincipalUserService } from './config/security/principal-user.service';

dotenv.config();

async function bootstrap() {
  const dataSource = new DataSource({
    type: 'sqlite', // Replace with your database type ('postgres', 'mysql', etc.)
    database:
      'C:/Users/machr/CEMETERY/cemetery-be/cemetery-db-lite/data/testdb', // Path to H2 database
    entities: [Permission], // Define your entities
    synchronize: true, // Automatically sync the schema (only for development)
    logging: true, // Optionally enable logging
  });

  await dataSource.initialize();
  console.log('Database connected successfully!');

  const permissionRepository = dataSource.getRepository(Permission);

  const app = express();
  app.use(express.urlencoded({ extended: true })); // For form data
  app.use(express.json()); // This is necessary to parse JSON in request body
  app.use(cors());
  const expressAdapter = new ExpressAdapter(app);

  // Create a NestJS app instance with the Express adapter
  const nestApp = await NestFactory.create(CemeteryModule, expressAdapter, {
    logger: console,
  });

  // Add custom routes directly with Express

  // Create a new SQLite database connection (or open the existing one)

  // Create a new SQLite database connection (or open the existing one)
  const db = new sqlite3.Database(
    `C:\\Users\\machr\\CEMETERY\\cemetery-be\\cemetery-db-lite\\data\\testdb`,
    sqlite3.OPEN_READWRITE,
    (err) => {
      console.log(err);
      if (err) {
        console.error('Failed to open the database:', err.message);
      } else {
        console.log('Connected to the SQLite database.');
      }
    },
  );

  // Utility function to promisify the db.all callback-based method
  function queryAsync(query: string, params: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Define your custom route
  app.get('/custom', async (req, res) => {
    let fullname = 'yosh'; // This could be dynamic based on req.query or req.body

    console.log({ fullname });
    const query = `
    SELECT * FROM CMN_TX_DECEASED
    WHERE LOWER(TRIM(COALESCE(FNAME, ''))) || ' ' || 
          LOWER(TRIM(COALESCE(MNAME, ''))) || ' ' || 
          LOWER(TRIM(COALESCE(LNAME, ''))) LIKE LOWER(?) 
    AND status = ?`;

    console.log(query);
    try {
      const rows = await queryAsync(query, [`%${fullname}%`, 1]);

      if (rows.length === 0) {
        return res.status(417).json({
          statusCode: 417,
          message: 'The niche name not found',
          deceasedList: [], // Return empty array if no records are found
        });
      }

      return res.status(200).json({
        statusCode: 200,
        message: 'Deceased found successfully',
        deceasedList: rows, // Return the list of deceased records
      });
    } catch (err) {
      console.error('Error occurred while searching for deceased:', err);
      return res.status(500).json({
        statusCode: 500,
        message: 'An error occurred while processing your request',
        deceasedList: [],
      });
    }
  });

  app.post('/api/deceased/create', async (req, res) => {
    let {
      firstName, // The variables will be passed as values for the placeholders.
      lastName,
      middleName,
      suffix,
      address,
      born,
      died,
      cemeteryLocation,
      datePermit,
      natureApp,
      layerNiche,
      layerAddress,
      payeeLastName,
      payeeFirstName,
      payeeMiddleName,
      payeeSuffix,
      payeeContact,
      payeeEmail,
      payeeAddress,
    } = req.body;

    try {
      let DECEASED_ID = uuidv4();
      let labelName = '';

      const query = `
      INSERT INTO "CMN_TX_DECEASED" 
        (
      
        "DECEASED_ID",
        "LABEL_NAME", "LNAME", "FNAME", "MNAME", "SUFFIX", "ADDRESS", "BORN", "DIED", "CMTRY_LOC", 
         "DATE_PERMIT", "NATURE_APP", "LAYER_NICHE", "LAYER_ADDR", "PAYEE_LNAME", "PAYEE_FNAME", "PAYEE_MNAME", 
         "PAYEE_SUFFIX", "PAYEE_CONTACT", "PAYEE_EMAIL", "PAYEE_ADDRESS", "OPT_1", "OPT_2", "REMARKS", "STATUS", 
         "CANVAS_MAP", "REASON", "ADDED_BY", "ADDED_DATE", "MODIFIED_BY", "MODIFIED_DATE")
      VALUES 
        (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
    `;

      const result = await queryAsync(query, [
        DECEASED_ID,
        labelName, // LABEL_NAME
        lastName, // LNAME
        firstName, // FNAME
        middleName, // MNAME
        suffix, // SUFFIX
        address, // ADDRESS
        born, // BORN
        died, // DIED
        cemeteryLocation, // CMTRY_LOC
        datePermit, // DATE_PERMIT
        natureApp, // NATURE_APP
        layerNiche, // LAYER_NICHE
        layerAddress, // LAYER_ADDR
        payeeLastName, // PAYEE_LNAME
        payeeFirstName, // PAYEE_FNAME
        payeeMiddleName, // PAYEE_MNAME
        payeeSuffix, // PAYEE_SUFFIX
        payeeContact, // PAYEE_CONTACT
        payeeEmail, // PAYEE_EMAIL
        payeeAddress, // PAYEE_ADDRESS
        '', // OPT_1 (empty value)
        '', // OPT_2 (empty value)
        '', // REMARKS (empty value)
        1, // STATUS
        '', // CANVAS_MAP (empty value)
        '', // REASON (empty value)
        'system', // ADDED_BY
        new Date().toISOString(), // ADDED_DATE
        '', // MODIFIED_BY (empty value)
        '', // MODIFIED_DATE (empty value)
      ]);

      res.status(201).json({
        message: 'Created successfully',
      });
    } catch (err) {
      console.error('Error creating deceased:', err.message);
      res.status(500).json({
        message: 'Failed to create deceased',
        error: err.message,
      });
    }
  });
  app.post('/api/users/create', async (req, res) => {
    const { email, firstName, lastName, middleName, password, role } = req.body;

    const query = `
      INSERT INTO CMN_DM_USR (
      ID,
      
      ROLE, ACCOUNT_TYPE, FIRST_NAME, LAST_NAME, PASSWORD, EMAIL, ADDED_DATE)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    try {
      const passwordNew = password || 'Password12345678';
      const hashedPassword = await bcrypt.hash(passwordNew, 10);
      let id = uuidv4();

      // Create new admin user
      // const adminUser = this.userRepository.create({
      //   id: uuidv4(),
      //   userId: 'admin',
      //   role: 'role_admin',
      //   accountType: 'admin',
      //   firstName: 'Admin',
      //   lastName: 'User',
      //   password: hashedPassword,
      //   email: adminEmail,
      //   gender: 'M',
      //   status: 1,
      //   addedBy: 'SYSTEM',
      //   addedDate: new Date().toISOString(),
      //   modifiedBy: 'SYSTEM',
      //   modifiedDate: new Date().toISOString(),
      // });

      console.log({
        id,
        role,
        firstName,
        lastName,
        hashedPassword,
        email,
      });
      const result = await queryAsync(query, [
        id,
        role,
        role,
        firstName,
        lastName,
        hashedPassword,
        email,
      ]);

      let newPermission;

      let accountType = role;

      if (accountType === 'guest') {
        newPermission = permissionRepository.create({
          email: email,
          role: 'role_user',
          accountType: 'guest',
          canViewLocalEconomicEnterprise: false,
          canViewMunicipalTreasurer: false,
          canViewGuest: true,
          canViewTotalPayment: false,
          canViewUserManagement: false,
          canViewProfiling: false,
          canViewMapping: true,
          canViewNotifications: false,
          canViewReports: false,
          canViewLogs: false,
          canViewSearchMap: true,
          actionLocalEconomicEnterprise: '',
          actionMunicipalTreasurer: '',
          actionGuest: '',
          actionTotalPayment: '',
          actionUserManagement: '',
          actionProfiling: '',
          actionMapping: 'search',
          actionNotifications: '',
          actionReports: '',
          actionLogs: '',
          actionSearchMap: 'search',
          status: 1, // Active status
          reason: null,
          addedBy: '',
          addedDate: new Date().toISOString(),
          modifiedBy: '',
          modifiedDate: new Date().toISOString(),
        });
      } else if (accountType === 'treasurer') {
        newPermission = permissionRepository.create({
          email: email,
          role: 'role_user',
          accountType: 'treasurer',
          canViewLocalEconomicEnterprise: true,
          canViewMunicipalTreasurer: true,
          canViewGuest: false,
          canViewTotalPayment: true,
          canViewUserManagement: true,
          canViewProfiling: true,
          canViewMapping: true,
          canViewNotifications: true,
          canViewReports: true,
          canViewLogs: true,
          actionLocalEconomicEnterprise: 'add|edit|delete',
          actionMunicipalTreasurer: 'add|edit|delete',
          actionGuest: 'add|edit|delete',
          actionTotalPayment: 'download|search',
          actionUserManagement: 'add|edit|delete|search',
          actionProfiling: 'add|edit|delete|search',
          actionMapping: 'add|edit|search',
          actionNotifications: 'search',
          actionReports: 'search|download',
          actionLogs: 'search',
          actionSearchMap: 'search',
          status: 1,
          reason: null,
          addedBy: '',
          addedDate: new Date().toISOString(),
          modifiedBy: '',
          modifiedDate: new Date().toISOString(),
        });

        console.log({ newPermission });
      } else if (accountType === 'admin') {
        newPermission = permissionRepository.create({
          email: email,
          role: 'role_admin',
          accountType: 'admin',
          canViewLocalEconomicEnterprise: true,
          canViewMunicipalTreasurer: true,
          canViewGuest: false,
          canViewTotalPayment: true,
          canViewUserManagement: true,
          canViewProfiling: true,
          canViewMapping: true,
          canViewNotifications: true,
          canViewReports: true,
          canViewLogs: true,
          actionLocalEconomicEnterprise: 'add|edit|delete',
          actionMunicipalTreasurer: 'add|edit|delete',
          actionGuest: 'add|edit|delete',
          actionTotalPayment: 'download|search',
          actionUserManagement: 'add|edit|delete|search',
          actionProfiling: 'add|edit|delete|search',
          actionMapping: 'add|edit|search',
          actionNotifications: 'search',
          actionReports: 'search|download',
          actionLogs: 'search',
          actionSearchMap: 'search',
          status: 1,
          reason: null,
          addedBy: '',
          addedDate: new Date().toISOString(),
          modifiedBy: '',
          modifiedDate: new Date().toISOString(),
        });
      } else if (accountType === 'enterprise') {
        newPermission = permissionRepository.create({
          email: email,
          role: 'role_user',
          accountType: 'enterprise',
          canViewLocalEconomicEnterprise: true,
          canViewMunicipalTreasurer: false,
          canViewGuest: false,
          canViewTotalPayment: true,
          canViewUserManagement: false,
          canViewProfiling: true,
          canViewMapping: true,
          canViewNotifications: false,
          canViewReports: false,
          canViewLogs: false,
          actionLocalEconomicEnterprise: 'add|edit|delete',
          actionMunicipalTreasurer: '',
          actionGuest: '',
          actionTotalPayment: 'download|search',
          actionProfiling: 'add|edit|delete|search',
          actionMapping: 'add|edit|search',
          actionNotifications: '',
          actionReports: '',
          actionLogs: '',
          actionSearchMap: 'search',
          status: 1,
          reason: null,
          addedBy: '',
          addedDate: new Date().toISOString(),
          modifiedBy: '',
          modifiedDate: new Date().toISOString(),
        });
      } else {
        throw new BadRequestException('Invalid account type');
      }

      const savedPermission = await permissionRepository.save(newPermission);
      res.status(201).json({
        message: 'User created successfully',
      });

      console.log('dex');
    } catch (err) {
      console.error('Error creating user:', err.message);
      res.status(500).json({
        message: 'Failed to create user',
        error: err.message,
      });
    }
  });

  app.post('/api/payments/create', async (req, res) => {
    try {
      const {
        DECEASED_ID,
        ADDED_BY,
        NUM_YEARS_PAY,
        AMOUNT_PER_YEAR,
        AMOUNT,
        ORDER_NO,
        PERMIT_NO,
        DATE_PAID,
        DECEASED_NAME,
        NEXT_PAYMENT_DATE,
      } = req.body;

      // Format the data
      const deceasedName = DECEASED_NAME;
      const addedDate = new Date().toISOString(); // Current date
      const nextPaymentDate = new Date(NEXT_PAYMENT_DATE);

      // Insert into the database
      const query = `
          INSERT INTO CMN_TX_PAYMENT (
              DECEASED_ID, DECEASED_NAME, DATE_PAID, KIND_PAYMENT, PERMIT_NO, ORDER_NO,
              AMOUNT, NUM_YEARS_PAY, NEXT_PAYMENT_DATE, REASON, STATUS,
              ADDED_BY, ADDED_DATE, MODIFIED_BY, MODIFIED_DATE
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      const result = await queryAsync(query, [
        DECEASED_ID, // DECEASED_ID (set to null if not provided)
        deceasedName, // DECEASED_NAME
        DATE_PAID, // DATE_PAID (set to current date)
        'Regular Payment', // KIND_PAYMENT (example type, can be customized)
        PERMIT_NO, // PERMIT_NO
        ORDER_NO, // ORDER_NO
        parseFloat(AMOUNT), // AMOUNT
        parseInt(NUM_YEARS_PAY), // NUM_YEARS_PAY
        NEXT_PAYMENT_DATE,
        null, // REASON (not provided)
        'Active', // STATUS (default to 'Active')
        ADDED_BY, // ADDED_BY
        addedDate, // ADDED_DATE
        null, // MODIFIED_BY (not provided)
        null, // MODIFIED_DATE (not provided)
      ]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error creating payment:', error.message);
      res.status(500).json({ error: 'Failed to create payment.' });
    }
  });

  // Get all payments
  app.post('/api/payments/all', async (req, res) => {
    try {
      const query = 'SELECT * FROM CMN_TX_PAYMENT';
      const rows = await queryAsync(query, []);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching payments:', error.message);
      res.status(500).json({ error: 'Failed to fetch payments.' });
    }
  });

  app.post('/api/deceased/list', async (req, res) => {
    try {
      const query = 'SELECT * FROM CMN_TX_DECEASED';
      const rows = await queryAsync(query, []);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching payments:', error.message);
      res.status(500).json({ error: 'Failed to fetch payments.' });
    }
  });

  // nestApp.enableCors({
  //   // origin: [
  //   //   'http://168.138.204.248',
  //   //   'http://localhost:5173',
  //   //   'http://localhost:3002',
  //   // ], // Add more origins as needed
  //   // methods: 'GET,POST,PATCH',
  //   // allowedHeaders: 'Content-Type,Authorization',
  //   // credentials: true,
  // });

  // Use global logging interceptor
  nestApp.useGlobalInterceptors(new LoggingInterceptor());

  // Conditionally enable Swagger based on the SWAGGER_ENABLE environment variable
  if (process.env.SWAGGER_ENABLE === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Cemetery Management And Guest Mapping API')
      .setDescription('API documentation for the Cemetery Service')
      .setVersion('1.0')
      .addBearerAuth() // Add authentication scheme if using JWT or similar
      .build();

    const document = SwaggerModule.createDocument(nestApp, config);
    SwaggerModule.setup('api-docs', nestApp, document); // Swagger UI will be available at /api-docs

    console.log(
      `Swagger UI is enabled at: http://localhost:${process.env.PORT || 3002}/api-docs`,
    );
  } else {
    console.log('Swagger UI is disabled.');
  }

  // Insert default admin user on boot
  const adminInsertService = nestApp.get(AdminInsertService);
  await adminInsertService.insertAdmin();

  // Set the port
  const port = process.env.PORT || 3000;

  console.log(`cemetery - ${port}`);

  await nestApp.listen(port, '0.0.0.0');

  console.log(`Application is runningssssss dex on: http://localhost:${port}`);
}

bootstrap();
