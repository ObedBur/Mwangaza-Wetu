"use client";

import { useState } from "react";
import MembersHeader from "@/components/members/MembersHeader";
import MembersStatsSection from "@/components/members/MembersStatsSection";
import MembersTable from "@/components/members/MembersTable";
import CreateMemberModal from "@/components/members/CreateMemberModal";
import { useCreateMember } from "@/hooks/useMembers";
import { MemberInput } from "@/lib/validations";

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: createMember } = useCreateMember();

  const handleCreateMember = async (data: MemberInput) => {
    try {
      await createMember(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create member:", error);
      // Ici on pourrait ajouter une notification d'erreur
    }
  };

  const handleMemberAction = (memberId: number) => {
    console.log("Action clicked for member:", memberId);
  };

  return (
    <div className="space-y-6">
      <MembersHeader onCreateClick={() => setIsModalOpen(true)} />

      <div className="grid gap-6">
        <MembersStatsSection />
        <MembersTable onActionClick={handleMemberAction} />
      </div>

      <CreateMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMember}
      />
    </div>
  );
}
