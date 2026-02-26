"use client";

import { useState } from "react";
import MembersHeader from "@/components/members/MembersHeader";
import MembersStatsSection from "@/components/members/MembersStatsSection";
import MembersTable from "@/components/members/MembersTable";
import CreateMemberModal from "@/components/members/CreateMemberModal";
import { useCreateMember } from "@/hooks/useMembers";
import { MemberInput } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: createMember } = useCreateMember();
  const { success: toastSuccess, error: toastError } = useToast();

  const handleCreateMemberSubmit = async (data: MemberInput) => {
    try {
      const response = await createMember(data);
      setIsModalOpen(false);
      toastSuccess(
        "Membre créé avec succès",
        `Le numéro de compte généré est : ${response.numeroCompte}`
      );
    } catch (error: any) {
      console.error("Failed to create member:", error);
      toastError(
        "Échec de la création",
        error.message || "Une erreur est survenue lors de la création du membre"
      );
    }
  };

  const handleMemberAction = (memberId: number) => {
    console.log("Action clicked for member:", memberId);
  };

  const handleCreateMemberModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <MembersHeader onCreateClick={handleCreateMemberModal} />

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
    </div>
  );
}
