package vaultWeb.dtos.user;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vaultWeb.models.SecurityEvent;
import vaultWeb.security.annotations.SecurityEventType;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SecurityEventDto {
  private Long id;
  private SecurityEventType eventType;
  private String status;
  private Instant timestamp;
  private String ipAddress;
  private String userAgent;
  private String location;

  public SecurityEventDto(SecurityEvent event) {
    this.id = event.getId();
    this.eventType = event.getEventType();
    this.status = event.getStatus();
    this.timestamp = event.getTimestamp();
    this.ipAddress = event.getIpAddress();
    this.userAgent = event.getUserAgent();
    this.location = event.getLocation();
  }
}
