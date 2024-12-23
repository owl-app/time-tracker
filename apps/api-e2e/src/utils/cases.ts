import { AvailableRoles, RolesEnum, RolesOptions } from '@owl-app/lib-contracts';

export function getCasesByRoleWithOwner(
  casesByOwner: Partial<Record<RolesOptions, RolesEnum[]>>
): [Partial<RolesEnum>, Partial<RolesEnum>, boolean][] {
  const result: [RolesEnum, RolesEnum, boolean][] = [];

  AvailableRoles.forEach((role) => {
      result.push([role, role, true]);
  });

  // superadmin has all checks
  AvailableRoles.forEach((role) => {
    if (role !== RolesEnum.ROLE_ADMIN_SYSTEM) {
      result.push([RolesEnum.ROLE_ADMIN_SYSTEM, role, true]);
    }
  });

  Object.keys(casesByOwner).forEach((role) => {
    casesByOwner[role as RolesEnum].forEach((roleOwner) => {
      result.push([role as RolesEnum, roleOwner, false]);
    });
  });

  return result;
}
