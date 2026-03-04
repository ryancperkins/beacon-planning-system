import { useAuth } from "@/contexts/AuthContext";

export function usePermissions() {
  const { role, userMinistries } = useAuth();

  const isAdmin = role === "admin";
  const isCreativeTeam = role === "creative_team";
  const isDirector = role === "ministry_director" || role === "ministry_leader";
  const isMentor = role === "mentor";
  const isMinistryUser = role === "ministry_user" || role === "community_member";

  const canApprove = isAdmin;
  const canTriage = isAdmin || isCreativeTeam;
  const canCreate = isAdmin || isCreativeTeam || isDirector;
  const canManageTeam = isAdmin;
  const canManageBudget = isAdmin;
  const canAddToLibrary = isAdmin || isCreativeTeam;
  const canSeeAllInitiatives = isAdmin || isCreativeTeam || isDirector || isMentor;

  const userMinistryIds = userMinistries.map((m) => m.ministry_id);

  const canEditInitiative = (ministryId: string) =>
    isAdmin || isCreativeTeam || (isDirector && userMinistryIds.includes(ministryId));

  const canToggleVisibility = (ministryId: string) =>
    isAdmin || isCreativeTeam || (isDirector && userMinistryIds.includes(ministryId));

  const canSeeInitiative = (initiative: { ministry_id: string; visible_to_all_staff?: boolean }) => {
    if (canSeeAllInitiatives) return true;
    if (userMinistryIds.includes(initiative.ministry_id)) return true;
    if (initiative.visible_to_all_staff) return true;
    return false;
  };

  const canAddNotes = (ministryId: string) =>
    isAdmin || isCreativeTeam || (isDirector && userMinistryIds.includes(ministryId)) || isMentor;

  return {
    role, isAdmin, isCreativeTeam, isDirector, isMentor, isMinistryUser,
    canApprove, canTriage, canCreate, canManageTeam, canManageBudget,
    canAddToLibrary, canSeeAllInitiatives, canEditInitiative,
    canToggleVisibility, canSeeInitiative, canAddNotes, userMinistryIds,
  };
}
