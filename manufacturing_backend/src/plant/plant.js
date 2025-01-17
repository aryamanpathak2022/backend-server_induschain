// plant.js

import prisma from "../../utils/prismaClient.js";

// create a plant
export const createPlant = async (req, res) => {

  const { name } = req.body;

  // Check if the logged-in user is an Owner
  if (req.user.role !== 'OWNER') {
    return res.status(403).json({ error: 'Only plant owners can create plants' });
  }

  try {
    // Create the plant and associate it with the owner
    const plant = await prisma.plant.create({
      data: {
        name,
        ownerId: req.user.id, // Associate plant with the logged-in user
      },
    });

    res.status(201).json({ message: 'Plant created successfully', plant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Other plant operations like updating, fetching, etc. can be added here.

// adding a manager to a plant

export const addManagerToPlant = async (req, res) => {
  const { userId, plantId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'MANAGER') {
      return res.status(400).json({ error: 'User must be a manager' });
    }

    const plant = await prisma.plant.update({
      where: { id: plantId },
      data: { managers: { connect: { id: userId } } },
    });

    res.json({ message: 'Manager added to plant', plant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// adding an engineer to a plant

export const addEngineerToPlant = async (req, res) => {
  const { userId, plantId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ENGINEER') {
      return res.status(400).json({ error: 'User must be an engineer' });
    }

    const plant = await prisma.plant.update({
      where: { id: plantId },
      data: { engineers: { connect: { id: userId } } },
    });

    res.json({ message: 'Engineer added to plant', plant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get plant details

export const getPlantDetails = async (req, res) => {
  const { plantId } = req.params;

  try {
    const plant = await prisma.plant.findUnique({
      where: { id: parseInt(plantId) },
      include: { owner: true, managers: true, engineers: true },
    });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// fetch plant members 
export const getPlantMembers = async (req, res) => {
  const { plantId } = req.params;

  try {
    const plant = await prisma.plant.findUnique({
      where: { id: parseInt(plantId) },
      include: {
        managers: true,
        engineers: true,
      },
    });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Ensure only the owner of the plant can access this data
    if (plant.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      managers: plant.managers,
      engineers: plant.engineers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// add manager or engineer by email
export const addMemberByEmail = async (req, res) => {
  const { plantId, email, role } = req.body;

  if (!['MANAGER', 'ENGINEER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const plant = await prisma.plant.findUnique({
      where: { id: parseInt(plantId) },
    });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Ensure only the owner can add members
    if (plant.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Ensure the user's role matches the requested role
    if (user.role !== role) {
      return res.status(400).json({ error: `User is not a ${role}` });
    }

    // Add the user to the appropriate relation in the plant
    if (role === 'MANAGER') {
      await prisma.plant.update({
        where: { id: parseInt(plantId) },
        data: { managers: { connect: { id: user.id } } },
      });
    } else if (role === 'ENGINEER') {
      await prisma.plant.update({
        where: { id: parseInt(plantId) },
        data: { engineers: { connect: { id: user.id } } },
      });
    }

    res.json({ message: `${role} added to plant successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// searching all the plants of a specific owner 
export const getPlantsByOwnerEmail = async (req, res) => {
  const { email } = req.params;

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // Fetch all plants associated with the owner's ID
    const plants = await prisma.plant.findMany({
      where: { ownerId: user.id },
    });

    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

