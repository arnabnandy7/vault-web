package vaultWeb.dtos;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vaultWeb.models.Group;

/**
 * Response representation of a {@link Group}. Unlike the JPA entity, this DTO only exposes fields
 * that are safe to send to clients, so member {@link vaultWeb.models.User} entities (which carry
 * the password hash) are never serialized directly.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponseDto {
  private Long id;
  private String name;
  private String description;
  private Boolean isPublic;
  private String createdAt;
  private List<GroupMemberDto> members;

  public static GroupResponseDto from(Group group) {
    List<GroupMemberDto> members =
        group.getMembers() == null
            ? List.of()
            : group.getMembers().stream().map(GroupMemberDto::from).toList();

    return new GroupResponseDto(
        group.getId(),
        group.getName(),
        group.getDescription(),
        group.getIsPublic(),
        group.getCreatedAt() != null ? group.getCreatedAt().toString() : null,
        members);
  }
}
