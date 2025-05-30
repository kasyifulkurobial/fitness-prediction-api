const Joi = require('joi');

const predictionSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  weight: Joi.number().min(30).max(300).required(),
  height: Joi.number().min(100).max(250).required(),
  age: Joi.number().min(10).max(100).required(),
  sitUpCounts: Joi.number().min(0).max(100).required(),
  broadJump: Joi.number().min(50).max(400).required()
});

const validatePredictionInput = (req, res, next) => {
  const { error } = predictionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }
  
  next();
};

module.exports = {
  validatePredictionInput
};