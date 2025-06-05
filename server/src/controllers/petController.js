const Pet = require('../models/Pet');

// Get all pets
const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching pets',
        details: error.message
      }
    });
  }
};

// Create a new pet
const createPet = async (req, res) => {
  try {
    const { id, name, tag } = req.body;

    // Validate required fields
    if (!id || !name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'id and name are required fields'
        }
      });
    }

    // Check if pet with same ID already exists
    const existingPet = await Pet.findOne({ id });
    if (existingPet) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Pet with this ID already exists'
        }
      });
    }

    const pet = new Pet({
      id,
      name,
      tag
    });

    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error creating pet',
        details: error.message
      }
    });
  }
};

// Get pet by ID
const getPetById = async (req, res) => {
  try {
    const { petId } = req.params;
    const pet = await Pet.findOne({ id: petId });

    if (!pet) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Pet not found'
        }
      });
    }

    res.json(pet);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching pet',
        details: error.message
      }
    });
  }
};

module.exports = {
  getAllPets,
  createPet,
  getPetById
}; 