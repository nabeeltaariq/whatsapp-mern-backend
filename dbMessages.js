const mongoose = require('mongoose')
const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
}
const whatsappSchema = mongoose.Schema({
  message: String,
  name: String,
  received: Boolean,
})
whatsappSchema.set('timestamps', true)
module.exports = mongoose.model('whatsappmessages', whatsappSchema)
