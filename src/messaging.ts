import { ClassConstructor } from "class-transformer";
import { getPlayer, getRandomNumber, MOD_DATA } from "./index";
import { hookFunction, HookPriority } from "./modsApi";
import { setFontFamily } from "./ui";
import { validateData } from "./validation";

const pendingRequests: Map<string, PendingRequest<any>> = new Map();
const requestListeners: Map<string, (data: any, sender: Character | number, senderName?: string) => any> = new Map();
const requestDtos: Map<string, ClassConstructor<unknown>> = new Map();

interface PendingRequest<T> {
	message: string
	data: T
	target: number
	resolve: (data: T) => any
	reject: (data: T) => any
}

interface RequestResponse<T> {
	data?: T
	isError: boolean
}

interface PacketRequestData {
	requestId: string
	message: string
	data: any
}

interface BeepRequestData {
	type: string
	requestId: string
	message: string
	data: any
}

type PacketRequestResponseData = PacketRequestData;
type BeepRequestResponseData = BeepRequestData;

class MessagesManager {
	sendBeep<T>(data: T, targetId: number): void {
		const beep = {
			IsSecret: true,
			BeepType: "Leash",
			MemberNumber: targetId,
			Message: JSON.stringify({
				...data
			})
		};
		ServerSend("AccountBeep", beep);
	}

	sendPacket<T>(msg: string, _data?: T, targetNumber?: number): void {
		const data: ServerChatRoomMessage = {
			Content: MOD_DATA.key,
			Dictionary: {
				// @ts-ignore
				msg
			},
			Type: "Hidden",
		};
		// @ts-ignore
		if (_data) data.Dictionary.data = _data;
		if (targetNumber) data.Target = targetNumber;
		ServerSend("ChatRoomChat", data);
	}

	sendAction(msg: string, target: undefined | number = undefined, dictionary: ChatMessageDictionaryEntry[] = []): void {
		if (!msg || !ServerPlayerIsInChatRoom()) return;

		const isFemale = CharacterPronounDescription(Player) === "She/Her";
		const capPossessive = isFemale ? "Her" : "His";
		const capIntensive = isFemale ? "Her" : "Him";
		const capSelfIntensive = isFemale ? "Herself" : "Himself";
		const capPronoun = isFemale ? "She" : "He";

		msg = msg
			.replaceAll("<Possessive>", capPossessive)
			.replaceAll("<possessive>", capPossessive.toLocaleLowerCase())
			.replaceAll("<Intensive>", capIntensive)
			.replaceAll("<intensive>", capIntensive.toLocaleLowerCase())
			.replaceAll("<SelfIntensive>", capSelfIntensive)
			.replaceAll("<selfIntensive>", capSelfIntensive.toLocaleLowerCase())
			.replaceAll("<Pronoun>", capPronoun)
			.replaceAll("<pronoun>", capPronoun.toLocaleLowerCase());

		ServerSend('ChatRoomChat', {
			Content: 'ZC_CUSTOM_ACTION',
			Type: 'Action',
			Target: target ?? undefined,
			Dictionary: [
				{ Tag: 'MISSING TEXT IN "Interface.csv": ZC_CUSTOM_ACTION', Text: msg },
				...dictionary,
			],
		});
	}

	sendRequest<T>({
		message, data = {}, target, type = "packet"
	}: {
		message: string
		data?: unknown
		target: number
		type: "packet" | "beep"
	}): Promise<RequestResponse<T>> {
		const requestId = crypto.randomUUID();
		return new Promise((resolve) => {
			let deleteHook: () => void;

			if (type === "packet") {
				messagesManager.sendPacket<PacketRequestData>("request", {
					requestId,
					message,
					data
				}, target);
				deleteHook = hookFunction("ChatRoomMessage", HookPriority.ADD_BEHAVIOR, (args, next) => {
					const _message = args[0];
					const sender = getPlayer(_message.Sender);
					if (!sender) return next(args);
					if (_message.Content === MOD_DATA.key && !sender.IsPlayer()) {
						const msg = _message.Dictionary.msg;
						const data = _message.Dictionary.data;
						if (msg === "requestResponse" && data.requestId === requestId) {
							deleteHook();
							resolve({
								data: data.data,
								isError: false
							});
						}
					}
					return next(args);
				});
			} else {
				messagesManager.sendBeep<BeepRequestData>({
					type: `${MOD_DATA.key}_request`,
					requestId,
					message,
					data
				}, target);
				deleteHook = hookFunction("ServerAccountBeep", HookPriority.ADD_BEHAVIOR, (args, next) => {
					const beep: ServerAccountBeepResponse = args[0];
					if (beep.BeepType !== "Leash") return next(args);

					let data: any;

					try {
						data = JSON.parse(beep.Message);
					} catch {
						return next(args);
					}

					if (data.type === `${MOD_DATA.key}_requestResponse` && data.requestId === requestId) {
						deleteHook();
						resolve({
							data: data.data,
							isError: false
						});
					}
					return next(args);
				});
			}

			setTimeout(() => {
				deleteHook();
				resolve({
					isError: true
				});
			}, 6000);
		});
	}

	sendLocal(message: string | Node): void {
		if (!ServerPlayerIsInChatRoom()) return;

		const div = document.createElement("div");
		div.setAttribute("class", "ChatMessage ChatMessageLocalMessage");
		div.setAttribute("data-time", ChatRoomCurrentTime());
		div.setAttribute("data-sender", `${Player.MemberNumber}`);
		setFontFamily(div, MOD_DATA.fontFamily);
		div.style.background = MOD_DATA.chatMessageBackground ?? "#55edc095";
		div.style.color = MOD_DATA.chatMessageColor ?? "black";
		div.style.margin = "0.15em 0";

		if (typeof message === "string") div.innerHTML = message;
		else div.appendChild(message);

		document.querySelector("#TextAreaChatLog").appendChild(div);
		ElementScrollToEnd("TextAreaChatLog");
	}

	sendChat(message: string): void {
		ServerSend("ChatRoomChat", { Type: "Chat", Content: message });
	}

	onRequest(
		message: string,
		listener: (data: any, sender: Character | number, senderName?: string) => unknown
	): void
	onRequest(
		message: string,
		dto: ClassConstructor<unknown>,
		listener: (data: any, sender: Character | number, senderName?: string) => unknown
	): void
	onRequest(
		message: string,
		dtoOrListener: ClassConstructor<unknown> | ((data: any, sender: Character | number, senderName?: string) => unknown),
		listener?: (data: any, sender: Character | number, senderName?: string) => unknown
	): void {
		let _listener: (data: any, sender: Character | number, senderName?: string) => unknown;
		let dto: ClassConstructor<unknown>;
		if (
			typeof dtoOrListener === "function" &&
			dtoOrListener.prototype?.constructor == dtoOrListener
		) {
			dto = dtoOrListener as ClassConstructor<unknown>;
			_listener = listener;
		} else _listener = dtoOrListener as (data: any, sender: Character | number, senderName?: string) => unknown;

		hookFunction("ChatRoomMessage", HookPriority.ADD_BEHAVIOR, async (args, next) => {
			const _message = args[0];
			const sender = getPlayer(_message.Sender);
			if (!sender) return next(args);
			if (_message.Content === MOD_DATA.key && !sender.IsPlayer()) {
				const msg = _message.Dictionary?.msg;
				const data = _message.Dictionary?.data;
				if (msg === "request" && data.message === message) {
					if (typeof data.requestId !== "string" || typeof data.message !== "string") return;
					if (dto && !(await validateData(data.data, dto)).isValid) return next(args);
					const _data = _listener(data.data, sender);
					if (_data !== undefined) {
						messagesManager.sendPacket<PacketRequestResponseData>("requestResponse", {
							requestId: data.requestId,
							message: data.message,
							data: _data
						}, sender.MemberNumber);
					}
				}
			}
			return next(args);
		});

		hookFunction("ServerAccountBeep", HookPriority.ADD_BEHAVIOR, async (args, next) => {
			const beep: ServerAccountBeepResponse = args[0];
			if (beep.BeepType !== "Leash") return next(args);

			let data: any;

			try {
				data = JSON.parse(beep.Message);
			} catch {
				return next(args);
			}

			if (data.type === `${MOD_DATA.key}_request` && data.message === message) {
				if (typeof data.requestId !== "string") return;
				if (dto && !(await validateData(data.data, dto)).isValid) return next(args);
				const _data = _listener(data.data, beep.MemberNumber, beep.MemberName);
				if (_data !== undefined) {
					messagesManager.sendBeep<BeepRequestResponseData>({
						type: `${MOD_DATA.key}_requestResponse`,
						requestId: data.requestId,
						message: data.message,
						data: _data
					}, beep.MemberNumber);
				}
			}
			return next(args);
		});
	}

	onPacket(
		message: string,
		listener: (data: any, sender: Character) => void,
	): void
	onPacket(
		message: string,
		dto: ClassConstructor<unknown>,
		listener: (data: any, sender: Character) => void,
	): void
	onPacket(
		message: string,
		dtoOrListener: ClassConstructor<unknown> | ((data: any, sender: Character) => void),
		listener?: (data: any, sender: Character) => void,
	): void {
		hookFunction("ChatRoomMessage", HookPriority.ADD_BEHAVIOR, async (args, next) => {
			let _listener: (data: any, sender: Character) => void;
			let dto: ClassConstructor<unknown>;
			if (
				typeof dtoOrListener === "function" &&
				dtoOrListener.prototype?.constructor == dtoOrListener
			) {
				dto = dtoOrListener as ClassConstructor<unknown>;
				_listener = listener;
			} else _listener = dtoOrListener as (data: any, sender: Character) => void;

			const _message = args[0];
			const sender = getPlayer(_message.Sender);
			if (!sender) return next(args);
			if (
				_message.Content === MOD_DATA.key &&
				_message.Dictionary.msg === message &&
				!sender.IsPlayer()
			) {
				if (dto && !(await validateData(_message.Dictionary?.data, dto)).isValid) return next(args);
				_listener(_message.Dictionary.data, sender);
			}
			return next(args);
		});
	}
}

export const messagesManager = new MessagesManager();