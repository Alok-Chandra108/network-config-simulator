// server/utils/seed.js
require('dotenv').config({ path: './.env' }); // Adjust path as necessary if .env is in root
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For hashing passwords
const User = require('../models/User'); // Path to your User model
const Device = require('../models/Device'); // Path to your Device model
const Configuration = require('../models/Configuration'); // Path to your Configuration model

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};

const importData = async () => {
    try {
        await connectDB(); // Connect to the database

        console.log('Clearing existing data...');
        await User.deleteMany();
        await Device.deleteMany();
        await Configuration.deleteMany();
        console.log('Existing data cleared!');

        console.log('Creating new users...');
        const salt = await bcrypt.genSalt(10); // Generate salt for hashing

        const adminUser = await User.create({
            username: 'Admin User',
            email: 'admin@example.com',
            password: await bcrypt.hash('password123', salt),
            roles: ['admin', 'user', 'viewer']
        });

        const regularUser = await User.create({
            username: 'Regular User',
            email: 'user@example.com',
            password: await bcrypt.hash('password123', salt),
            roles: ['user', 'viewer']
        });

        const viewerUser = await User.create({
            username: 'Viewer User',
            email: 'viewer@example.com',
            password: await bcrypt.hash('password123', salt),
            roles: ['viewer']
        });
        console.log('Users created!');

        console.log('Creating new devices...');
        const device1 = await Device.create({
            name: 'Main Router',
            type: 'Router',
            ipAddress: '192.168.1.1',
            location: 'Main Office',
            description: 'Cisco Catalyst 9000 Series Router',
            currentConfiguration: null, // Will be set after config is created
            addedBy: adminUser._id // Link to admin user
        });

        const device2 = await Device.create({
            name: 'Core Switch',
            type: 'Switch',
            ipAddress: '10.0.0.254',
            location: 'Data Center',
            description: 'Juniper EX Series Switch',
            currentConfiguration: null,
            addedBy: regularUser._id // Link to regular user
        });

        const device3 = await Device.create({
            name: 'Edge Firewall',
            type: 'Firewall',
            ipAddress: '203.0.113.1',
            location: 'Perimeter',
            description: 'Palo Alto Networks Firewall',
            currentConfiguration: null,
            addedBy: adminUser._id
        });

        const device4 = await Device.create({
            name: 'Access Point 1',
            type: 'Other',
            ipAddress: '192.168.1.100',
            location: 'Office Floor 1',
            description: 'Ubiquiti UniFi AC Pro',
            currentConfiguration: null,
            addedBy: regularUser._id
        });
        console.log('Devices created!');


        console.log('Creating configurations...');
        // Configuration for Device 1 (Main Router)
        const config1_v1 = await Configuration.create({
            deviceId: device1._id, // <--- Corrected this line
            version: 1,
            content: `
hostname MainRouter
interface GigabitEthernet0/1
 ip address 192.168.1.1 255.255.255.0
 no shutdown
line vty 0 4
 password cisco
 login
            `,
            pushedBy: adminUser.username,
            isCurrent: true // This will be the first current config
        });

        const config1_v2 = await Configuration.create({
            deviceId: device1._id, // <--- Corrected this line
            version: 2,
            content: `
hostname MainRouter-Updated
interface GigabitEthernet0/1
 ip address 192.168.1.1 255.255.255.0
 no shutdown
ip route 0.0.0.0 0.0.0.0 192.168.1.254
line vty 0 4
 password cisco123
 login
            `,
            pushedBy: regularUser.username,
            isCurrent: false // Will be set to true if user chooses to revert
        });

        // Update device1 to point to its current configuration
        await Device.findByIdAndUpdate(device1._id, { currentConfiguration: config1_v1._id });


        // Configuration for Device 2 (Core Switch)
        const config2_v1 = await Configuration.create({
            deviceId: device2._id, // <--- Corrected this line
            version: 1,
            content: `
hostname CoreSwitch
vlan 10
 name Users
vlan 20
 name Servers
interface GigabitEthernet0/1
 switchport access vlan 10
 switchport mode access
            `,
            pushedBy: adminUser.username,
            isCurrent: true
        });
        await Device.findByIdAndUpdate(device2._id, { currentConfiguration: config2_v1._id });

        // Configuration for Device 3 (Edge Firewall)
        const config3_v1 = await Configuration.create({
            deviceId: device3._id, // <--- Corrected this line
            version: 1,
            content: `
set security zones security-zone trust interfaces ge-0/0/0.0 host-inbound-traffic system-services all
set security policies from-zone trust to-zone untrust policy allow-web match application junos-http
            `,
            pushedBy: regularUser.username,
            isCurrent: true
        });
        await Device.findByIdAndUpdate(device3._id, { currentConfiguration: config3_v1._id });

        // Configuration for Device 4 (Access Point) - no current config initially
        const config4_v1 = await Configuration.create({
            deviceId: device4._id, // <--- Corrected this line
            version: 1,
            content: `
ssid Guest-WiFi
 vlan 50
 exit
ssid Main-WiFi
 vlan 10
 exit
            `,
            pushedBy: adminUser.username,
            isCurrent: false
        });


        console.log('Configurations created and linked!');

        console.log('Data Import SUCCESS!');
        process.exit();
    } catch (error) {
        console.error(`Data Import ERROR: ${error.message}`);
        console.error(error); // Log full error for debugging
        process.exit(1); // Exit process with failure
    } finally {
        // Disconnect after operation if not already done by process.exit
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('MongoDB Disconnected.');
        }
    }
};

importData();