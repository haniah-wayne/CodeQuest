export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "14.5";
	};
	public: {
		Tables: {
			AnswerChoices: {
				Row: {
					AnswerText: string;
					ChoiceID: number;
					IsCorrect: boolean;
					QuestionID: number;
				};
				Insert: {
					AnswerText: string;
					ChoiceID?: never;
					IsCorrect?: boolean;
					QuestionID: number;
				};
				Update: {
					AnswerText?: string;
					ChoiceID?: never;
					IsCorrect?: boolean;
					QuestionID?: number;
				};
				Relationships: [
					{
						foreignKeyName: "AnswerChoices_QuestionID_fkey";
						columns: ["QuestionID"];
						isOneToOne: false;
						referencedRelation: "Questions";
						referencedColumns: ["QuestionID"];
					},
				];
			};
			ChallengeCompletions: {
				Row: {
					ChallengeID: number;
					CompletedAt: string | null;
					CompletionID: number;
					StartedAt: string;
					Status: string;
				};
				Insert: {
					ChallengeID: number;
					CompletedAt?: string | null;
					CompletionID?: never;
					StartedAt?: string;
					Status: string;
				};
				Update: {
					ChallengeID?: number;
					CompletedAt?: string | null;
					CompletionID?: never;
					StartedAt?: string;
					Status?: string;
				};
				Relationships: [
					{
						foreignKeyName: "ChallengeCompletions_ChallengeID_fkey";
						columns: ["ChallengeID"];
						isOneToOne: false;
						referencedRelation: "Challenges";
						referencedColumns: ["ChallengeID"];
					},
				];
			};
			Challenges: {
				Row: {
					ChallengeID: number;
					ChallengeType: string | null;
					ClassID: number;
					CreatedAt: string;
					Description: string | null;
					Instructions: string | null;
					Points: number;
					Title: string;
				};
				Insert: {
					ChallengeID?: never;
					ChallengeType?: string | null;
					ClassID: number;
					CreatedAt?: string;
					Description?: string | null;
					Instructions?: string | null;
					Points?: number;
					Title: string;
				};
				Update: {
					ChallengeID?: never;
					ChallengeType?: string | null;
					ClassID?: number;
					CreatedAt?: string;
					Description?: string | null;
					Instructions?: string | null;
					Points?: number;
					Title?: string;
				};
				Relationships: [
					{
						foreignKeyName: "Challenges_ClassID_fkey";
						columns: ["ClassID"];
						isOneToOne: false;
						referencedRelation: "Classes";
						referencedColumns: ["ClassID"];
					},
				];
			};
			CheckIns: {
				Row: {
					ChallengeID: number;
					CheckedInAt: string;
					CheckInID: number;
					Distance: number | null;
					Latitude: number;
					Longitude: number;
					StudentID: string;
					Successful: boolean;
				};
				Insert: {
					ChallengeID: number;
					CheckedInAt?: string;
					CheckInID?: never;
					Distance?: number | null;
					Latitude: number;
					Longitude: number;
					StudentID: string;
					Successful?: boolean;
				};
				Update: {
					ChallengeID?: number;
					CheckedInAt?: string;
					CheckInID?: never;
					Distance?: number | null;
					Latitude?: number;
					Longitude?: number;
					StudentID?: string;
					Successful?: boolean;
				};
				Relationships: [
					{
						foreignKeyName: "CheckIns_ChallengeID_fkey";
						columns: ["ChallengeID"];
						isOneToOne: false;
						referencedRelation: "Challenges";
						referencedColumns: ["ChallengeID"];
					},
					{
						foreignKeyName: "CheckIns_StudentID_fkey";
						columns: ["StudentID"];
						isOneToOne: false;
						referencedRelation: "Profile";
						referencedColumns: ["ID"];
					},
				];
			};
			Classes: {
				Row: {
					ClassCode: string;
					ClassID: number;
					ClassName: string;
					color: string | null;
					CreatedAt: string;
					Description: string | null;
					ProfessorID: string;
				};
				Insert: {
					ClassCode: string;
					ClassID?: never;
					ClassName: string;
					color?: string | null;
					CreatedAt?: string;
					Description?: string | null;
					ProfessorID: string;
				};
				Update: {
					ClassCode?: string;
					ClassID?: never;
					ClassName?: string;
					color?: string | null;
					CreatedAt?: string;
					Description?: string | null;
					ProfessorID?: string;
				};
				Relationships: [
					{
						foreignKeyName: "Classes_ProfessorID_fkey";
						columns: ["ProfessorID"];
						isOneToOne: false;
						referencedRelation: "Profile";
						referencedColumns: ["ID"];
					},
				];
			};
			Enrollment: {
				Row: {
					ClassID: number;
					EnrolledAt: string;
					EnrollmentID: number;
					StudentID: string;
				};
				Insert: {
					ClassID: number;
					EnrolledAt?: string;
					EnrollmentID?: never;
					StudentID: string;
				};
				Update: {
					ClassID?: number;
					EnrolledAt?: string;
					EnrollmentID?: never;
					StudentID?: string;
				};
				Relationships: [
					{
						foreignKeyName: "Enrollment_ClassID_fkey";
						columns: ["ClassID"];
						isOneToOne: false;
						referencedRelation: "Classes";
						referencedColumns: ["ClassID"];
					},
					{
						foreignKeyName: "Enrollment_StudentID_fkey";
						columns: ["StudentID"];
						isOneToOne: false;
						referencedRelation: "Profile";
						referencedColumns: ["ID"];
					},
				];
			};
			Locations: {
				Row: {
					ChallengeID: number;
					Latitude: number;
					LocationID: number;
					Longitude: number;
					Radius: number;
				};
				Insert: {
					ChallengeID: number;
					Latitude: number;
					LocationID?: never;
					Longitude: number;
					Radius: number;
				};
				Update: {
					ChallengeID?: number;
					Latitude?: number;
					LocationID?: never;
					Longitude?: number;
					Radius?: number;
				};
				Relationships: [
					{
						foreignKeyName: "Locations_ChallengeID_fkey";
						columns: ["ChallengeID"];
						isOneToOne: false;
						referencedRelation: "Challenges";
						referencedColumns: ["ChallengeID"];
					},
				];
			};
			Profile: {
				Row: {
					Email: string | null;
					ID: string;
					Name: string;
					Password: string | null;
					Role: string;
				};
				Insert: {
					Email?: string | null;
					ID: string;
					Name: string;
					Password?: string | null;
					Role: string;
				};
				Update: {
					Email?: string | null;
					ID?: string;
					Name?: string;
					Password?: string | null;
					Role?: string;
				};
				Relationships: [];
			};
			Questions: {
				Row: {
					ChallengeID: number;
					QuestionID: number;
					QuestionText: string;
					QuestionType: string;
				};
				Insert: {
					ChallengeID: number;
					QuestionID?: never;
					QuestionText: string;
					QuestionType: string;
				};
				Update: {
					ChallengeID?: number;
					QuestionID?: never;
					QuestionText?: string;
					QuestionType?: string;
				};
				Relationships: [
					{
						foreignKeyName: "Questions_ChallengeID_fkey";
						columns: ["ChallengeID"];
						isOneToOne: false;
						referencedRelation: "Challenges";
						referencedColumns: ["ChallengeID"];
					},
				];
			};
			StudentAnswers: {
				Row: {
					AnswerText: string | null;
					ChoiceID: number | null;
					IsCorrect: boolean | null;
					QuestionID: number;
					StudentAnswersID: number;
					StudentID: string;
					SubmittedAt: string;
				};
				Insert: {
					AnswerText?: string | null;
					ChoiceID?: number | null;
					IsCorrect?: boolean | null;
					QuestionID: number;
					StudentAnswersID?: never;
					StudentID: string;
					SubmittedAt?: string;
				};
				Update: {
					AnswerText?: string | null;
					ChoiceID?: number | null;
					IsCorrect?: boolean | null;
					QuestionID?: number;
					StudentAnswersID?: never;
					StudentID?: string;
					SubmittedAt?: string;
				};
				Relationships: [
					{
						foreignKeyName: "StudentAnswers_ChoiceID_fkey";
						columns: ["ChoiceID"];
						isOneToOne: false;
						referencedRelation: "AnswerChoices";
						referencedColumns: ["ChoiceID"];
					},
					{
						foreignKeyName: "StudentAnswers_QuestionID_fkey";
						columns: ["QuestionID"];
						isOneToOne: false;
						referencedRelation: "Questions";
						referencedColumns: ["QuestionID"];
					},
					{
						foreignKeyName: "StudentAnswers_StudentID_fkey";
						columns: ["StudentID"];
						isOneToOne: false;
						referencedRelation: "Profile";
						referencedColumns: ["ID"];
					},
				];
			};
			Submission: {
				Row: {
					ChallengeID: number;
					Code: string | null;
					Feedback: string | null;
					Language: string | null;
					Output: string | null;
					Score: number | null;
					StudentID: string;
					SubmissionID: number;
					SubmittedAt: string;
				};
				Insert: {
					ChallengeID: number;
					Code?: string | null;
					Feedback?: string | null;
					Language?: string | null;
					Output?: string | null;
					Score?: number | null;
					StudentID: string;
					SubmissionID?: never;
					SubmittedAt?: string;
				};
				Update: {
					ChallengeID?: number;
					Code?: string | null;
					Feedback?: string | null;
					Language?: string | null;
					Output?: string | null;
					Score?: number | null;
					StudentID?: string;
					SubmissionID?: never;
					SubmittedAt?: string;
				};
				Relationships: [
					{
						foreignKeyName: "Submission_ChallengeID_fkey";
						columns: ["ChallengeID"];
						isOneToOne: false;
						referencedRelation: "Challenges";
						referencedColumns: ["ChallengeID"];
					},
					{
						foreignKeyName: "Submission_StudentID_fkey";
						columns: ["StudentID"];
						isOneToOne: false;
						referencedRelation: "Profile";
						referencedColumns: ["ID"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			is_class_professor: { Args: { class_id: number }; Returns: boolean };
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends (DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never) = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends (DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never) = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends (DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never) = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends (DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never) = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
