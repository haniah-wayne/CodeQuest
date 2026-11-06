"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// group updates together
const REFRESH_DELAY = 300;

export function ClassRealtime({ classId }: { classId: number }) {
	const router = useRouter();

	useEffect(() => {
		const supabase = createClient();

		let timeout: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;

		const channel = supabase
			.channel(`class:${classId}`, { config: { private: true } })
			.on("broadcast", { event: "changed" }, () => {
				clearTimeout(timeout);

				timeout = setTimeout(() => router.refresh(), REFRESH_DELAY);
			});

		// Private channels authorize with the user's JWT, so load it first
		supabase.realtime.setAuth().then(() => {
			if (cancelled) return;

			channel.subscribe((status, error) => {
				if (error) {
					console.error(error);
				} else if (status === "CHANNEL_ERROR") {
					console.error(`Realtime ${status}`);
				}
			});
		});

		return () => {
			cancelled = true;
			clearTimeout(timeout);
			supabase.removeChannel(channel);
		};
	}, [classId, router]);

	return null;
}
