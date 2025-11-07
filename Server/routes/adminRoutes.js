import express from 'express';
import { adminRegister, adminLogin } from '../controller/admin.js';

const router = express.Router();

router.post('/admin-register', adminRegister);
router.post('/admin-login', adminLogin);

export default router;