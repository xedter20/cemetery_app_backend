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

import * as mysql from 'mysql2'; // This is the proper way to import mysql2 in modern JavaScript (ES6+)
import * as cron from 'node-cron';
import * as moment from 'moment';
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dextermiranda441@gmail.com', // Replace with your email
    pass: 'oczk mljj symm bjgc', // Replace with your email password
  },
});

dotenv.config();

async function bootstrap() {
  const dataSource = new DataSource({
    type: 'sqlite', // Replace with your database type ('postgres', 'mysql', etc.)
    database: 'C:/DexDev/sqlite/data/testdb', // Path to H2 database
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
  const pool = await mysql.createPool({
    host: 'jcqlf1.stackhero-network.com',
    user: 'root',
    password: 'OwhHbxDtBwsDB9VlClLwfkzw9MTBr70m',
    database: 'cemetery_db',
    port: 4300,
  });
  // Utility function to promisify the db.all callback-based method
  // Utility function to promisify the db.query callback-based method
  async function queryAsync(query: string, params: any[]): Promise<any> {
    try {
      const [results, fields] = await pool.promise().execute(query, params);

      // Check if the query is a SELECT query based on the presence of rows
      if (query.trim().startsWith('SELECT')) {
        return results; // Return rows for SELECT queries
      } else {
        return results; // Return OkPacket for non-SELECT queries (e.g., INSERT, UPDATE)
      }
    } catch (error) {
      throw new Error(`Query failed: ${error.message}`);
    }
  }
  app.get('/custom', async (req, res) => {
    let fullname = 'yosh'; // This could be dynamic based on req.query or req.body

    console.log({ fullname });
    const query = `
    SELECT * FROM cmn_tx_deceased
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

  app.get('/api/deceased/getPayments/:DECEASED_ID', async (req, res) => {
    let DECEASED_ID = req.params.DECEASED_ID;

    try {
      const query = `
    
      SELECT * FROM cmn_tx_payment WHERE DECEASED_ID = '${DECEASED_ID}'
      ORDER BY SEQ_NO ASC;
      `;

      const rows = await queryAsync(query, [DECEASED_ID]);

      return res.status(200).json({
        statusCode: 200,
        message: 'Deceased found successfully',
        data: rows, // Return the list of deceased records
      });
    } catch (err) {
      console.error('Error occurred while searching for deceased:', err);
      return res.status(500).json({
        statusCode: 500,
        message: 'An error occurred while processing your request',
        data: [],
      });
    }
  });

  app.get('/api/guest/search', async (req, res) => {
    try {
      const fullname = String(req.query.fullname);

      // Decode the URL-encoded string and replace '+' with spaces
      const decodedFullname = decodeURIComponent(fullname.replace(/\+/g, ' '));

      console.log({ decodedFullname });

      const query = `
SELECT * 
FROM cmn_tx_deceased
WHERE CONCAT(
          TRIM(LOWER(COALESCE(cmn_tx_deceased.FNAME, ''))), 
          ' ', 
          TRIM(LOWER(COALESCE(cmn_tx_deceased.MNAME, ''))), 
          ' ', 
          TRIM(LOWER(COALESCE(cmn_tx_deceased.LNAME, '')))
        ) LIKE LOWER(CONCAT('%', ?, '%'))
  AND cmn_tx_deceased.status = 1;
    `;

      const rows = await queryAsync(query, [decodedFullname]);

      res.json({
        success: true,
        data: rows,
      });
    } catch (err) {
      console.error('Error occurred while searching for deceased:', err);
      return res.status(500).json({
        statusCode: 500,
        message: 'An error occurred while processing your request',
        data: [],
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

      const queryCheckIfExists = `
    SELECT COUNT(*) AS count
    FROM cmn_tx_deceased
    WHERE FNAME = ? AND LNAME = ? AND MNAME = ? AND DIED = ? AND BORN = ? 
  `;

      const resultCheck = await queryAsync(queryCheckIfExists, [
        firstName,
        lastName,
        middleName,
        died,
        born,
      ]);

      // Check if no records match the criteria
      if (resultCheck[0].count > 0) {
        return res
          .status(400)
          .json({ success: false, message: 'Deceased already exists' });
      }

      const query = `
      INSERT INTO cmn_tx_deceased (
            DECEASED_ID,
          LABEL_NAME,
          LNAME,
          FNAME,
          MNAME,
          SUFFIX,
          ADDRESS,
          BORN,
          DIED,
          CMTRY_LOC,
          DATE_PERMIT,
          NATURE_APP,
          LAYER_NICHE,
          LAYER_ADDR,
          PAYEE_LNAME,
          PAYEE_FNAME,
          PAYEE_MNAME,
          PAYEE_SUFFIX,
          PAYEE_CONTACT,
          PAYEE_EMAIL,
          PAYEE_ADDRESS,
          OPT_1,
          OPT_2,
          REMARKS,
          STATUS,
          CANVAS_MAP,
          REASON,
          ADDED_BY,
          ADDED_DATE,
          MODIFIED_BY,
          MODIFIED_DATE

      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      );
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

  app.put('/api/deceased/update/:id', async (req, res) => {
    const DECEASED_ID = req.params.id;
    const {
      firstName,
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
      const queryCheckIfExists = `
            SELECT COUNT(*) AS count FROM cmn_tx_deceased WHERE DECEASED_ID = ?
        `;

      const resultCheck = await queryAsync(queryCheckIfExists, [DECEASED_ID]);

      if (resultCheck[0].count === 0) {
        return res
          .status(404)
          .json({ success: false, message: 'Deceased record not found' });
      }

      const query = `
            UPDATE cmn_tx_deceased
            SET 
                LNAME = ?,
                FNAME = ?,
                MNAME = ?,
                SUFFIX = ?,
                ADDRESS = ?,
                BORN = ?,
                DIED = ?,
                CMTRY_LOC = ?,
                DATE_PERMIT = ?,
                NATURE_APP = ?,
                LAYER_NICHE = ?,
                LAYER_ADDR = ?,
                PAYEE_LNAME = ?,
                PAYEE_FNAME = ?,
                PAYEE_MNAME = ?,
                PAYEE_SUFFIX = ?,
                PAYEE_CONTACT = ?,
                PAYEE_EMAIL = ?,
                PAYEE_ADDRESS = ?,
                MODIFIED_BY = ?,
                MODIFIED_DATE = ?
            WHERE DECEASED_ID = ?;
        `;

      await queryAsync(query, [
        lastName,
        firstName,
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
        'system', // MODIFIED_BY
        new Date().toISOString(), // MODIFIED_DATE
        DECEASED_ID,
      ]);

      res.status(200).json({ message: 'Updated successfully' });
    } catch (err) {
      console.error('Error updating deceased:', err.message);
      res
        .status(500)
        .json({ message: 'Failed to update deceased', error: err.message });
    }
  });

  app.post('/api/users/create', async (req, res) => {
    const { email, firstName, lastName, middleName, password, role } = req.body;

    try {
      const passwordNew = password || 'Password12345678';
      const hashedPassword = await bcrypt.hash(passwordNew, 10);
      let id = uuidv4();

      const emailCheckQuery = `SELECT COUNT(*) AS count FROM cmn_dm_usr WHERE EMAIL = ?`;
      const resultCheck = await queryAsync(emailCheckQuery, [email]);

      // Check the count from the query result
      if (resultCheck[0].count > 0) {
        return res
          .status(400)
          .json({ success: false, message: 'Email already exists' });
      }

      const query = `
      INSERT INTO cmn_dm_usr (
      ID,
      
      ROLE, ACCOUNT_TYPE, FIRST_NAME, LAST_NAME, PASSWORD, EMAIL, ADDED_DATE)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

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
          INSERT INTO cmn_tx_payment (
              DECEASED_ID, DECEASED_NAME, KIND_PAYMENT, PERMIT_NO, ORDER_NO,
              AMOUNT, NUM_YEARS_PAY, NEXT_PAYMENT_DATE, REASON, STATUS,
              ADDED_BY, MODIFIED_BY, MODIFIED_DATE , AMOUNT_PER_YEAR
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? );
      `;

      const result = await queryAsync(query, [
        DECEASED_ID, // DECEASED_ID (set to null if not provided)
        deceasedName, // DECEASED_NAME
        'Regular Payment', // KIND_PAYMENT (example type, can be customized)
        PERMIT_NO, // PERMIT_NO
        ORDER_NO, // ORDER_NO
        parseFloat(AMOUNT), // AMOUNT
        parseInt(NUM_YEARS_PAY), // NUM_YEARS_PAY
        NEXT_PAYMENT_DATE,
        null, // REASON (not provided)
        'Active', // STATUS (default to 'Active')
        ADDED_BY, // ADDED_BY
        null, // MODIFIED_BY (not provided)
        null,
        AMOUNT_PER_YEAR,
      ]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error creating payment:', error.message);
      res.status(500).json({ error: 'Failed to create payment.' });
    }
  });

  app.get('/api/deceased/list', async (req, res) => {
    try {
      const query = `
      SELECT * 
      FROM cmn_tx_deceased
    `;
      const rows = await queryAsync(query, []);

      res.json({
        success: true,
        data: rows,
      });
    } catch (err) {
      console.error('Error occurred while searching for deceased:', err);
      return res.status(500).json({
        statusCode: 500,
        message: 'An error occurred while processing your request',
        data: [],
      });
    }
  });

  // update canvass maps
  app.post('/api/update_canvass_map', async (req, res) => {
    try {
      let data = req.body;

      let { CANVAS_MAP, deceasedId } = data;
      const query = `
      UPDATE cmn_tx_deceased 
      SET CANVAS_MAP = ?

      where DECEASED_ID  = ? 
      
      `;
      const rows = await queryAsync(query, [CANVAS_MAP, deceasedId]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update' });
    }
  });

  // Get all payments
  app.post('/api/payments/all', async (req, res) => {
    try {
      const query = `
      
          WITH MaxSeq AS (
      SELECT DECEASED_ID, MAX(SEQ_NO) AS max_seq_no
      FROM cmn_tx_payment
      GROUP BY DECEASED_ID
    )
    SELECT p.*
    FROM cmn_tx_payment p
    JOIN MaxSeq m ON p.DECEASED_ID = m.DECEASED_ID AND p.SEQ_NO = m.max_seq_no
    ORDER BY p.SEQ_NO DESC;

      
      `;
      const rows = await queryAsync(query, []);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching payments:', error.message);
      res.status(500).json({ error: 'Failed to fetch payments.' });
    }
  });

  app.get('/api/payments_report', async (req, res) => {
    try {
      const { year, period } = req.query;

      let sql = `SELECT DATE_PAID, DECEASED_NAME, ORDER_NO, KIND_PAYMENT, AMOUNT FROM cmn_tx_payment WHERE 1=1`;

      // Apply Year filter
      if (year) {
        sql += ` AND YEAR(DATE_PAID) = ${mysql.escape(year)}`;
      }

      // Apply Period filter
      if (period) {
        if (period === 'Annual') {
          sql += ` AND DATE_PAID BETWEEN '${year}-01-01' AND '${year}-12-31'`;
        } else if (period === 'Semi-Annual') {
          sql += ` AND (MONTH(DATE_PAID) BETWEEN 1 AND 6 OR MONTH(DATE_PAID) BETWEEN 7 AND 12)`;
        } else if (period === 'Quarterly') {
          sql += ` AND QUARTER(DATE_PAID) IN (1, 2, 3, 4)`;
        }
      }

      const rows = await queryAsync(sql, []);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching payments:', error.message);
      res.status(500).json({ error: 'Failed to fetch payments.' });
    }
  });

  app.post('/api/deceased/list', async (req, res) => {
    try {
      const query = 'SELECT * FROM cmn_tx_deceased';
      const rows = await queryAsync(query, []);
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching payments:', error.message);
      res.status(500).json({ error: 'Failed to fetch payments.' });
    }
  });

  app.get('/api/fetchAllDuePayments', async (req, res) => {
    try {
      let query = `
      SELECT * FROM cmn_tx_payment p LEFT JOIN cmn_tx_deceased d 
      ON p.DECEASED_ID = d.DECEASED_ID
       WHERE p.NEXT_PAYMENT_DATE <= CURDATE() + INTERVAL 11 MONTH AND p.NEXT_PAYMENT_DATE > CURDATE();
    `;

      const rows = await queryAsync(query, []);
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch payments.' });
    }
  });
  app.post('/api/sendPaymentReminder', async (req, res) => {
    const { email, message } = req.body;

    try {
      // Check if user exists

      // Configure nodemailer

      // Email options
      const mailOptions = {
        from: 'dextermiranda441@gmail.com',
        to: email,
        subject: 'Payment Reminder',
        html: `
        
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <div style="text-align: center;">
        <h2 style="color: #333;">Payment Reminder</h2>
       
      </div>
      
      <div style="background-color: white; padding: 15px; border-radius: 5px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; color: #333;">${message}</p>
      </div>

      <p style="font-size: 14px; color: #777; margin-top: 20px;">If you have already made the payment, please disregard this message.</p>



      <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">Thank you for your prompt attention to this matter.</p>
    </div>
        `,
      };

      // Send the email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ success: false, message: 'Failed to send email' });
        }
        res.status(200).json({ success: true, message: 'Email sent' });
      });
    } catch (error) {
      console.error('rror:', error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  });
  // nestApp.enableCors({
  //   // origin: [
  //   //   'http://168.138.204.248',
  //   //   'http://localhost:5173',
  //   //   'http://localhost:3001',
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

  // await cron.schedule('*/5 * * * * *', async () => {
  //   console.log('Running cron job to check payments...123');

  //   const today = moment().format('YYYY-MM-DD');
  //   const threeDaysBeforeOrEqual = moment().add(3, 'days').format('YYYY-MM-DD');

  //   // Query the cmn_tx_payment table for upcoming payments

  //   console.log({ threeDaysBeforeOrEqual });
  //   const query = `
  //     SELECT * FROM cmn_tx_payment
  //       WHERE NEXT_PAYMENT_DATE <= ?
  //   `;

  //   try {
  //     const results = await queryAsync(query, [threeDaysBeforeOrEqual]);

  //     console.log({ results });
  //   } catch (err) {
  //     console.error('Database query error:', err.message);
  //   }
  // });

  await nestApp.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
