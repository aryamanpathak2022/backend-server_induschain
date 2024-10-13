import express from 'express';
import {addEngineerToPlant, addManagerToPlant, getPlantDetails, createPlant, addMemberByEmail, getPlantMembers, getPlantsByOwnerEmail} from '../plant/plant.js';
import {roleMiddleware, authMiddleware} from '../../middleware/authMiddleware.js';


const router = express.Router();

// Only owners can create plants
router.post('/create', authMiddleware, roleMiddleware(['OWNER']), createPlant);

// Only plant owners can add managers or engineers
router.post('/add-manager', authMiddleware, roleMiddleware(['OWNER']), addManagerToPlant);
router.post('/add-engineer', authMiddleware, roleMiddleware(['OWNER']), addEngineerToPlant);

// Managers and Engineers can view plant details, but not edit them
router.get('/details/:plantId', authMiddleware, roleMiddleware(['OWNER','MANAGER', 'ENGINEER']), getPlantDetails);

router.get(
    '/:plantId/members',
    authMiddleware,
    roleMiddleware(['OWNER']),
    getPlantMembers
  );

router.post(
    '/:plantId/add-member',
    authMiddleware,
    roleMiddleware(['OWNER']),
    addMemberByEmail
);

router.get('/owner/:email', authMiddleware, getPlantsByOwnerEmail);

export default router;
