// models/Datasets.js
const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    headers: [String],
    rows: [{
        type: mongoose.Schema.Types.Mixed
    }],
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedAt: {
        type: Date,
        default: null
    },
    restoredAt: {
        type: Date,
        default: null
    },
    // Which sheet this dataset was imported from
    sourceSheet: {
        type: String,
        default: null
    },
    // Auto-detected column name for Year Level filtering
    yearLevelField: {
        type: String,
        default: null
    },
    // Auto-detected column name for Program/Department filtering
    programField: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Dataset', datasetSchema);