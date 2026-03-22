"use client";

import { useState } from "react";
import MembersHeader from "@/components/members/MembersHeader";
import MembersStatsSection from "@/components/members/MembersStatsSection";
import MembersTable from "@/components/members/MembersTable";
import CreateMemberModal from "@/components/members/CreateMemberModal";
import ViewMemberModal from "@/components/members/ViewMemberModal";
import { useCreateMember, useMembers } from "@/hooks/useMembers";
import { MemberInput } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMemberId, setViewMemberId] = useState<number | null>(null);
  
  const { mutateAsync: createMember } = useCreateMember();
  const { success: toastSuccess, error: toastError } = useToast();
  
  // Récupérer tous les membres pour les exports
  const { data: allMembersResponse } = useMembers({ 
    page: 1, 
    pageSize: 1000 // Récupérer jusqu'à 1000 membres pour les exports
  });
  const allMembers = allMembersResponse?.data ?? [];

  const handleCreateMemberSubmit = async (data: MemberInput) => {
    try {
      const response = await createMember(data);
      console.log(" Membre créé avec succès :", response);
      // On ne ferme plus le modal ici, on laisse le modal gérer l'état de succès
      toastSuccess(
        "Membre créé avec succès",
        `Le numéro de compte généré est : ${response.numeroCompte}`
      );
      return response; // Retourner pour le modal
    } catch (error: any) {
      console.error(" Impossible de créer le membre", error);
      toastError(
        "Échec de la création",
        error.message || "Une erreur est survenue lors de la création du membre"
      );
      throw error;
    }
  };

  const handleMemberAction = (memberId: number) => {
    setViewMemberId(memberId);
  };

  const handleCreateMemberModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <MembersHeader
        onCreateClick={handleCreateMemberModal}
        members={allMembers}
      />

      <div className="grid gap-6">
        <MembersStatsSection />
        <MembersTable
          onActionClick={handleMemberAction}
          onCreateMember={handleCreateMemberModal}
        />
      </div>

      <CreateMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMemberSubmit}
      />

      <ViewMemberModal
        isOpen={viewMemberId !== null}
        memberId={viewMemberId}
        onClose={() => setViewMemberId(null)}
      />
    </div>
  );
}
