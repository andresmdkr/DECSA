const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('Client', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: true,
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        holderNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        holderName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        extraAddressInfo: {
            type: DataTypes.STRING,
        },
        barrio: {                
            type: DataTypes.STRING,
        },
        postalAddress: {
            type: DataTypes.STRING,
        },
        extraPostalAddressInfo: {
            type: DataTypes.STRING,
        },
        service: {
            type: DataTypes.STRING,
        },
        category: {
            type: DataTypes.STRING,
        },
        dateOfEntry: {
            type: DataTypes.DATE,
        },
        dateOfTermination: {
            type: DataTypes.DATE,
        },
        device: {
            type: DataTypes.STRING,
        },
        zone: {
            type: DataTypes.STRING,
        },
        sector: {
            type: DataTypes.STRING,
        },
        route: {
            type: DataTypes.STRING,
        },
        supply: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.STRING,
        },
        voltage: {
            type: DataTypes.STRING,
        },
        wsg84Long: {
            type: DataTypes.DECIMAL(10, 7),
        },
        wsg84Lati: {
            type: DataTypes.DECIMAL(10, 7),
        },
        locality: {
            type: DataTypes.STRING,
        },
        department: {
            type: DataTypes.STRING,
        },
        province: {
            type: DataTypes.STRING,
        },
        substation: {
            type: DataTypes.STRING,
        },
        distributor: {
            type: DataTypes.STRING,
        },
        dni: {
            type: DataTypes.STRING,
        },
        phone: {
            type: DataTypes.STRING,
        },
        auxPhone: {
            type: DataTypes.STRING,
        },
        outputBT: {  
            type: DataTypes.STRING,
        },
        connection: {  
            type: DataTypes.STRING,
        },
    }, { timestamps: false });
};
