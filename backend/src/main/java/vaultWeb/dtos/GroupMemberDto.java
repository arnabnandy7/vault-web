package vaultWeb.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vaultWeb.models.GroupMember;

/**
 * Response representation of a {@link GroupMember}. Exposes only the member's id, role and a
 * minimal user projection, so the password hash on {@link vaultWeb.models.User} is never
 * serialized.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDto {
  private Long id;
  private GroupUserDto user;
  private String role;

  public static GroupMemberDto from(GroupMember member) {
    return new GroupMemberDto(
        member.getId(),
        GroupUserDto.from(member.getUser()),
        member.getRole() != null ? member.getRole().name() : null);
  }

  /** Minimal user fields exposed inside a group member; never includes the password hash. */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class GroupUserDto {
    private Long id;
    private String username;

    public static GroupUserDto from(vaultWeb.models.User user) {
      if (user == null) {
        return null;
      }
      return new GroupUserDto(user.getId(), user.getUsername());
    }
  }
}
