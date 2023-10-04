# Food Dispenser Backend

Welcome to the Food Dispenser Backend, the server-side component of the Chicken Feeder. This backend API is responsible for handling data, authentication, and communication with the frontend. It is built using Node.js and MongoDB and uses the node-schedule library for scheduling chicken feeding times.

## Features

- **User Authentication:** Secure user authentication and registration.
- **Data Handling:** Manage chicken feeder devices, user data, and feedback.
- **Scheduled Feeding:** Use node-schedule to schedule automatic chicken feedings.
- **Data Storage:** Store daily, weekly, and monthly feeding reports.

## Technologies Used

- **Node.js:** Backend server environment.
- **MongoDB:** Database for storing data.
- **node-schedule:** Library for scheduling tasks.
- **Express.js:** Web framework for building APIs.


## Installation

1. Clone the repository:
``` bash
git clone https://github.com/wubeZ/food-dispenser-backend.git

``` 

2. Navigate to the project directory:
``` bash
cd food-dispenser-backend

```

3. Install the required dependencies:
```bash
npm install

```

4. Set up the database:

Make sure you have MongoDB installed and running on your machine.
Update the MongoDB connection string in the configuration file (.env).

5. Start the server:

```bash
npm start

```

## MQTT Integration

The Chicken Feeder Backend seamlessly integrates with MQTT (Message Queuing Telemetry Transport) for efficient communication with hardware components. MQTT is a lightweight protocol commonly used in IoT (Internet of Things) applications, making it ideal for real-time interactions with the chicken feeding hardware.

For detailed configuration and usage instructions regarding MQTT, please refer to the specific documentation or code comments within the backend source code.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
