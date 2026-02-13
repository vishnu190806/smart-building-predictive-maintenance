import random
import math
from datetime import datetime, timedelta

class SimulationService:
    def __init__(self):
        # Initial State
        self.health = 98.5
        self.energy_base = 400
        self.occupants_base = 1200
        self.active_alerts = 3
        
        # Shared live state
        self.current_energy = 452
        self.current_occupants = 1245
        
        # Cache for charts
        self.energy_chart_data = self._generate_energy_profile()
        
        # Live Chart History (persistent state)
        self.live_chart_history = []
        self._init_live_chart()

    def _init_live_chart(self):
        """Initialize chart with 30 points of history (last 60s)."""
        now = datetime.now()
        for i in range(30):
            t = now - timedelta(seconds=(29-i)*2)
            self.live_chart_history.append({
                "name": t.strftime("%H:%M:%S"),
                "uv": self.energy_base + random.randint(-50, 50),
                "pv": self.energy_base + 400 + random.randint(-50, 50)
            })

    def _generate_energy_profile(self):
        """Generates a 24h energy load profile."""
        data = []
        for hour in range(0, 24, 4):
            time_label = f"{hour:02d}:00"
            
            # Peak during day (9am - 5pm), low at night
            is_day = 8 <= hour <= 18
            base_load = 800 if is_day else 150
            load = base_load + random.randint(-50, 100)
            occupancy = 800 if is_day else 20
            
            data.append({
                "time": time_label,
                "load": load,
                "occupancy": occupancy
            })
        return data

    def get_dashboard_stats(self):
        """Returns real-time dashboard stats with slight random fluctuations."""
        
        # Fluctuate Health
        change = random.uniform(-0.1, 0.1)
        self.health = max(90.0, min(100.0, self.health + change))
        
        # Fluctuate Energy (Live update)
        timestamp = datetime.now().hour
        is_peak = 9 <= timestamp <= 17
        
        # Base vibration (Increased Volatility)
        fluctuation = random.randint(-40, 60) # Significantly more noise
        
        # Introduce occasional spikes
        if random.random() > 0.95:
             fluctuation += random.randint(100, 200) # Sudden Spike
        
        target_energy = (self.energy_base * 1.5) if is_peak else self.energy_base
        
        # FASTER response (Less smoothing: 0.7 * old + 0.3 * new)
        self.current_energy = int(self.current_energy * 0.7 + (target_energy + fluctuation) * 0.3)
        
        # Fluctuate Occupants
        target_occupants = (self.occupants_base * 0.9) if is_peak else 50
        self.current_occupants = int(self.current_occupants * 0.9 + (target_occupants + random.randint(-20, 30)) * 0.1)
        
        # Update Chart History synchronously with stats
        self._update_live_chart()

        return {
            "health": {
                "value": f"{self.health:.1f}%",
                "trend": f"{abs(change):.1f}%",
                "trendUp": change > 0
            },
            "energy": {
                "value": f"{self.current_energy} kWh",
                "trend": "1.2%",
                "trendUp": False
            },
            "occupants": {
                "value": f"{self.current_occupants}",
                "trend": "12",
                "trendUp": True
            },
            "alerts": {
                "value": str(self.active_alerts),
                "trend": "0",
                "trendUp": False
            }
        }

    def _update_live_chart(self):
        """Adds a new point to the rolling chart history."""
        now = datetime.now()
        
        # Only add if time has moved forward significantly (throttle to ~1s)
        last_time_str = self.live_chart_history[-1]["name"]
        if now.strftime("%H:%M:%S") == last_time_str:
            return

        # Add distinct noise to chart point so it doesn't look like a perfect smoothed line
        chart_noise = random.randint(-30, 30)
        
        new_point = {
            "name": now.strftime("%H:%M:%S"),
            "uv": self.current_energy + chart_noise, # Synced but with extra noise
            "pv": int(self.current_energy * 1.2) + random.randint(-100, 100)
        }
        
        self.live_chart_history.append(new_point)
        if len(self.live_chart_history) > 30: # Keep last 30 points
            self.live_chart_history.pop(0)

    def get_dashboard_chart(self):
        """Returns the rolling window data."""
        return self.live_chart_history

    def get_energy_chart(self):
        return self.energy_chart_data

    # Reporting
    def get_reports(self):
        return [
            { "id": 'REP-2024-001', "name": 'Monthly Energy Consumption', "date": 'Oct 24, 2024', "type": 'PDF', "status": 'Ready' },
            { "id": 'REP-2024-002', "name": 'Security Breach Analysis', "date": 'Oct 23, 2024', "type": 'CSV', "status": 'Ready' },
            { "id": 'REP-2024-003', "name": 'HVAC Performance Audit', "date": 'Oct 22, 2024', "type": 'PDF', "status": 'Ready' },
        ]

simulation = SimulationService()
