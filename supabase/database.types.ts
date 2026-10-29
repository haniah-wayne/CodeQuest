export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      Challenges: {
        Row: {
          ChallengeID: number
          ChallengeType: string | null
          ClassID: number
          CodeLanguage: string | null
          CreatedAt: string
          Description: string | null
          IsPublished: boolean | null
          MaxAttempts: number | null
          Points: number
          Title: string
        }
        Insert: {
          ChallengeID?: number
          ChallengeType?: string | null
          ClassID: number
          CodeLanguage?: string | null
          CreatedAt?: string
          Description?: string | null
          IsPublished?: boolean | null
          MaxAttempts?: number | null
          Points?: number
          Title: string
        }
        Update: {
          ChallengeID?: number
          ChallengeType?: string | null
          ClassID?: number
          CodeLanguage?: string | null
          CreatedAt?: string
          Description?: string | null
          IsPublished?: boolean | null
          MaxAttempts?: number | null
          Points?: number
          Title?: string
        }
        Relationships: [
          {
            foreignKeyName: "Challenges_ClassID_fkey"
            columns: ["ClassID"]
            isOneToOne: false
            referencedRelation: "Classes"
            referencedColumns: ["ClassID"]
          },
        ]
      }
      CheckIns: {
        Row: {
          ChallengeID: number
          CheckedInAt: string
          CheckInID: number
          Distance: number | null
          Latitude: number
          Longitude: number
          StudentID: string
          Successful: boolean
        }
        Insert: {
          ChallengeID: number
          CheckedInAt?: string
          CheckInID?: never
          Distance?: number | null
          Latitude: number
          Longitude: number
          StudentID: string
          Successful?: boolean
        }
        Update: {
          ChallengeID?: number
          CheckedInAt?: string
          CheckInID?: never
          Distance?: number | null
          Latitude?: number
          Longitude?: number
          StudentID?: string
          Successful?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "CheckIns_ChallengeID_fkey"
            columns: ["ChallengeID"]
            isOneToOne: false
            referencedRelation: "Challenges"
            referencedColumns: ["ChallengeID"]
          },
          {
            foreignKeyName: "CheckIns_StudentID_fkey"
            columns: ["StudentID"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["ID"]
          },
        ]
      }
      Classes: {
        Row: {
          ClassCode: string
          ClassID: number
          ClassName: string
          CreatedAt: string
          Description: string | null
          ProfessorID: string
        }
        Insert: {
          ClassCode: string
          ClassID?: number
          ClassName: string
          CreatedAt?: string
          Description?: string | null
          ProfessorID: string
        }
        Update: {
          ClassCode?: string
          ClassID?: number
          ClassName?: string
          CreatedAt?: string
          Description?: string | null
          ProfessorID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Classes_ProfessorID_fkey"
            columns: ["ProfessorID"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["ID"]
          },
        ]
      }
      Enrollment: {
        Row: {
          ClassID: number
          EnrolledAt: string
          EnrollmentID: number
          StudentID: string
        }
        Insert: {
          ClassID: number
          EnrolledAt?: string
          EnrollmentID?: never
          StudentID: string
        }
        Update: {
          ClassID?: number
          EnrolledAt?: string
          EnrollmentID?: never
          StudentID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Enrollment_ClassID_fkey"
            columns: ["ClassID"]
            isOneToOne: false
            referencedRelation: "Classes"
            referencedColumns: ["ClassID"]
          },
          {
            foreignKeyName: "Enrollment_StudentID_fkey"
            columns: ["StudentID"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["ID"]
          },
        ]
      }
      Locations: {
        Row: {
          ChallengeID: number
          Latitude: number
          LocationID: number
          Longitude: number
          Radius: number
        }
        Insert: {
          ChallengeID: number
          Latitude: number
          LocationID?: never
          Longitude: number
          Radius: number
        }
        Update: {
          ChallengeID?: number
          Latitude?: number
          LocationID?: never
          Longitude?: number
          Radius?: number
        }
        Relationships: [
          {
            foreignKeyName: "Locations_ChallengeID_fkey"
            columns: ["ChallengeID"]
            isOneToOne: false
            referencedRelation: "Challenges"
            referencedColumns: ["ChallengeID"]
          },
        ]
      }
      Profile: {
        Row: {
          Email: string | null
          ID: string
          Name: string
          Password: string | null
          Role: string
        }
        Insert: {
          Email?: string | null
          ID: string
          Name: string
          Password?: string | null
          Role: string
        }
        Update: {
          Email?: string | null
          ID?: string
          Name?: string
          Password?: string | null
          Role?: string
        }
        Relationships: []
      }
      Solutions: {
        Row: {
          ChallengeID: number
          Solution: string
        }
        Insert: {
          ChallengeID?: number
          Solution: string
        }
        Update: {
          ChallengeID?: number
          Solution?: string
        }
        Relationships: [
          {
            foreignKeyName: "Solutions_ChallengeID_fkey"
            columns: ["ChallengeID"]
            isOneToOne: true
            referencedRelation: "Challenges"
            referencedColumns: ["ChallengeID"]
          },
        ]
      }
      Submission: {
        Row: {
          AttemptNum: number | null
          ChallengeID: number
          Code: string | null
          Language: string | null
          Output: string | null
          Score: number | null
          Status: string | null
          StudentID: string
          SubmissionID: number
          SubmittedAt: string
        }
        Insert: {
          AttemptNum?: number | null
          ChallengeID: number
          Code?: string | null
          Language?: string | null
          Output?: string | null
          Score?: number | null
          Status?: string | null
          StudentID: string
          SubmissionID?: number
          SubmittedAt?: string
        }
        Update: {
          AttemptNum?: number | null
          ChallengeID?: number
          Code?: string | null
          Language?: string | null
          Output?: string | null
          Score?: number | null
          Status?: string | null
          StudentID?: string
          SubmissionID?: number
          SubmittedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Submission_ChallengeID_fkey"
            columns: ["ChallengeID"]
            isOneToOne: false
            referencedRelation: "Challenges"
            referencedColumns: ["ChallengeID"]
          },
          {
            foreignKeyName: "Submission_StudentID_fkey"
            columns: ["StudentID"]
            isOneToOne: false
            referencedRelation: "Profile"
            referencedColumns: ["ID"]
          },
        ]
      }
      TestCase: {
        Row: {
          ChallengeID: number
          CreatedAt: string | null
          ExpectedOutput: string | null
          Input: string | null
          Score: number | null
          TestCaseID: number
        }
        Insert: {
          ChallengeID: number
          CreatedAt?: string | null
          ExpectedOutput?: string | null
          Input?: string | null
          Score?: number | null
          TestCaseID?: number
        }
        Update: {
          ChallengeID?: number
          CreatedAt?: string | null
          ExpectedOutput?: string | null
          Input?: string | null
          Score?: number | null
          TestCaseID?: number
        }
        Relationships: [
          {
            foreignKeyName: "TestCase_ChallengeID_fkey"
            columns: ["ChallengeID"]
            isOneToOne: false
            referencedRelation: "Challenges"
            referencedColumns: ["ChallengeID"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_challenge: {
        Args: {
          class_id: number
          description: string
          lat: number
          long: number
          radius: number
          solution: string
          title: string
        }
        Returns: number
      }
      delete_own_account: { Args: never; Returns: undefined }
      get_class_leaderboard: {
        Args: { p_class_id: number }
        Returns: {
          rank: number
          student_id: string
          student_name: string
          total_score: number
        }[]
      }
      get_global_leaderboard: { Args: never; Returns: undefined }
      is_class_professor: { Args: { class_id: number }; Returns: boolean }
      join_class_by_code: { Args: { class_code: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
