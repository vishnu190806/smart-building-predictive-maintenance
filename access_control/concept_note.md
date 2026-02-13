# Concept Note: Smart Building Access Control System

## Executive Summary
This project demonstrates a data-driven approach to building security using a relational database. By digitizing access logs and user permissions, facility managers can automate entry validation, detect security anomalies, and optimize building operations based on usage patterns.

## System Architecture

The core of the system relies on three interconnected SQL tables:

1.  **Users**: The "source of truth" for identity. It defines who is who (Name, Department) and their permissions (Access Level: Full/Limited/Visitor).
2.  **Doors**: Represents the physical infrastructure. It categorizes entry points by Zone (Secure, Public) and Floor, allowing for granular security policies.
3.  **Access_Logs**: The audit trail. Every swipe/entry attempt is recorded with a timestamp and status (Granted/Denied), enabling historical analysis.

## Key Capabilities & Insights

### 1. Automated Security Monitoring
*   **Unauthorized Access Detection**: The system instantly flags attempts by users to enter restricted areas (e.g., Visitors trying to enter Server Rooms).
*   **Time-Based Anomalies**: Queries identify access attempts outside standard business hours (e.g., late-night entries), which could indicate potential security breaches or policy violations.

### 2. Operational Intelligence
*   **Traffic Analysis**: By aggregating logs, we identified peak entry hours. This allows for better resource allocation (e.g., scheduling more security guards or receptionists during busy times).
*   **Space Utilization**: We track which zones and floors are most frequently used, helping facility managers understand building occupancy trends.

### 3. Incident Forensics
*   **Repeated Denials**: The system highlights users with multiple failed attempts, which may signal a lost badge, a technical error, or a malicious actor trying to force entry.

## Future Enhancements
*   **Real-time Alerts**: Trigger SMS/Email notifications for "Repeated Denied" events.
*   **Biometric Integration**: Link `User_ID` to fingerprint or facial recognition data for higher security.
*   **Role-Based Access Control (RBAC)**: Refine permissions to automatically grant/revoke access based on Department changes.

---
*Generated for Session 6: The Digital Doorman*
