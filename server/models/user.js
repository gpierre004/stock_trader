// models/user.js
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: false // Disable timestamps to prevent automatic column creation/alteration
    });
    
    return User;
};
