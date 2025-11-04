import express from 'express';
import {
  createServiceAgreement,
  acceptAgreement,
  confirmWorkStart,
  confirmWorkComplete,
  getUserAgreements,
  getAgreementDetails,
  createDispute
} from '../controllers/agreementController';

const router = express.Router();

// 🛡️ RUTAS DEL SISTEMA DE SEGURIDAD

// Crear acuerdo de servicio (Proveedor activa servicio)
router.post('/create', createServiceAgreement);

// Aceptar acuerdo (Cliente acepta términos)
router.post('/:agreementId/accept', acceptAgreement);

// Confirmar inicio del trabajo (Ambos usuarios)
router.post('/:agreementId/confirm-start', confirmWorkStart);

// Confirmar finalización del trabajo (Ambos usuarios)
router.post('/:agreementId/confirm-complete', confirmWorkComplete);

// Obtener acuerdos del usuario
router.get('/my-agreements', getUserAgreements);

// Obtener detalles de un acuerdo específico
router.get('/:agreementId', getAgreementDetails);

// Crear disputa
router.post('/:agreementId/dispute', createDispute);

export default router;

