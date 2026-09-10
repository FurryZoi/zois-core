import { ClassConstructor } from "class-transformer";
import { getPlayer, MOD_DATA } from "./index";
import { hookFunction, HookPriority } from "./modSdk";
import { setFontFamily } from "./ui";
import { validateData } from "./validation";
import { logger } from "./logging";

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

type RequestResponse<T> = {
	data?: T;
	isError: false;
} | {
	isError: true;
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

// @ts-expect-error This is gonna blow up in the face of anyone expecting Dictionary to be an array
interface ZoiChatRoomMessage extends ServerChatRoomMessage {
	Content: string;
	Dictionary: { [key: string]: any };
	Type: "Hidden";
}

// @ts-expect-error Lying so hard there
function isZoiChatRoomMessage(m: ServerChatRoomMessage): m is ZoiChatRoomMessage {
	return m.Content === MOD_DATA.key;
}

function isClassConstructor(c: unknown): c is ClassConstructor<unknown> {
	return typeof c === "function" && c.prototype?.constructor == c
}

class MessagesManager {
	/**
	 * Sends beep message to a specific player.
	 * @param data - The data to send in the beep.
	 * @param targetId - The member number of the target player.
	 */
	public sendBeep<T>(data: T, targetId: number): void {
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

	/**
	 * Sends hidden packet message to the chat room or a specific player.
	 * @param msg - The message identifier.
	 * @param _data - Optional data payload to include.
	 * @param targetNumber - Optional target player member number.
	 */
	public sendPacket<T>(msg: string, _data?: T, targetNumber?: number): void {
		const data: ZoiChatRoomMessage = {
			Content: MOD_DATA.key,
			Dictionary: {
				msg
			},
			Type: "Hidden",
		};
		if (_data) data.Dictionary.data = _data;
		if (targetNumber) data.Target = targetNumber;
		ServerSend("ChatRoomChat", data);
	}

	/**
	 * Sends a custom action message to the chat room with automatic pronoun replacement.
	 * 
	 * Replaces placeholders such as `<Possessive>`, `<Intensive>`, `<SelfIntensive>`, and `<Pronoun>`.
	 * @param msg - The action message text.
	 * @param target - Optional target player member number.
	 * @param dictionary - Optional additional dictionary entries.
	 */
	public sendAction(msg: string, target: undefined | number = undefined, dictionary: ChatMessageDictionaryEntry[] = []): void {
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

		ServerSend("ChatRoomChat", {
			Content: "Beep",
			Type: "Action",
			Target: target ?? undefined,
			Dictionary: [
				// EN
				{ Tag: "Beep", Text: "msg" },
				// CN
				{ Tag: "发送私聊", Text: "msg" },
				// DE
				{ Tag: "Biep", Text: "msg" },
				// FR
				{ Tag: "Sonner", Text: "msg" },
				// RU
				{ Tag: "Звуковой сигнал", Text: "msg" },
				{ Tag: "msg", Text: msg },
				...dictionary,
			],
		});
	}

	/**
	 * Sends a request to a target player and waits for a response.
	 * 
	 * Supports both packet and beep transport. Automatically times out after 6 seconds.
	 * @param options - Request configuration.
	 * @param options.message - The request message identifier.
	 * @param options.data - Optional data to send with the request.
	 * @param options.target - Target player member number.
	 * @param options.type - Transport type: `"packet"` or `"beep"`.
	 * @returns A promise that resolves with the response data or an error flag.
	 */
	public sendRequest<T>({
		message, data = {}, target, type = "packet", responseDto
	}: {
		message: string
		data?: unknown
		target: number
		type: "packet" | "beep",
		responseDto?: ClassConstructor<unknown>
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
				deleteHook = hookFunction("ChatRoomMessage", HookPriority.ADD_BEHAVIOR, async (args, next) => {
					const _message = args[0];
					const sender = getPlayer(_message.Sender!);
					if (!sender) return next(args);
					if (isZoiChatRoomMessage(_message) && !sender.IsPlayer()) {
						const msg = _message.Dictionary.msg;
						const data = _message.Dictionary.data;
						if (msg === "requestResponse" && data.requestId === requestId) {
							deleteHook();
							if (responseDto) {
								const validationResult = await validateData(data.data, responseDto);
								if (!validationResult.isValid) {
									logger.warn(`DTO Failure:`, validationResult);
									resolve({
										isError: true
									});
								}
							}
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
				deleteHook = hookFunction("ServerAccountBeep", HookPriority.ADD_BEHAVIOR, async (args, next) => {
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
						if (responseDto) {
							const validationResult = await validateData(data.data, responseDto);
							if (!validationResult.isValid) {
								logger.warn(`DTO Failure:`, validationResult);
								resolve({
									isError: true
								});
							}
						}
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

	/**
	 * Displays a local message in the chat log (visible only to the current player).
	 * @param message - The message content as a string or DOM node.
	 */
	public sendLocal(message: string | Node): void {
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

		document.querySelector("#TextAreaChatLog")?.appendChild(div);
		ElementScrollToEnd("TextAreaChatLog");
	}

	/**
	 * Sends a regular chat message to the chat room.
	 * @param message - The chat message content.
	 */
	public sendChat(message: string): void {
		ServerSend("ChatRoomChat", { Type: "Chat", Content: message });
	}

	/**
	 * Registers a listener for incoming requests of a specific message type.
	 * Supports optional DTO validation. Works with both packet and beep transports.
	 * @param message - The request message identifier to listen for.
	 * @param dtoOrListener - Optional DTO class constructor or the listener function.
	 * @param listener - The listener function.
	 * @returns A cleanup function that removes the registered listeners.
	 */
	public onRequest(
		message: string,
		listener: (data: any, sender: Character | number, senderName?: string) => unknown
	): () => void
	public onRequest(
		message: string,
		dto: ClassConstructor<unknown>,
		listener: (data: any, sender: Character | number, senderName?: string) => unknown
	): () => void
	public onRequest(
		message: string,
		dtoOrListener: ClassConstructor<unknown> | ((data: any, sender: Character | number, senderName?: string) => unknown),
		listener?: (data: any, sender: Character | number, senderName?: string) => unknown
	): () => void {
		let _listener: ((data: any, sender: Character | number, senderName?: string) => unknown) | undefined;
		let dto: ClassConstructor<unknown>;
		if (isClassConstructor(dtoOrListener)) {
			dto = dtoOrListener;
			_listener = listener;
		} else {
			_listener = dtoOrListener;
		}

		const rm1 = hookFunction("ChatRoomMessage", HookPriority.ADD_BEHAVIOR, async (args, next) => {
			const _message = args[0];
			const sender = getPlayer(_message.Sender!);
			if (!sender) return next(args);
			if (isZoiChatRoomMessage(_message) && !sender.IsPlayer()) {
				const msg = _message.Dictionary?.msg;
				const data = _message.Dictionary?.data;
				if (msg === "request" && data.message === message) {
					if (typeof data.requestId !== "string" || typeof data.message !== "string") return;
					if (dto) {
						const validationResult = await validateData(data.data, dto);
						if (!validationResult.isValid) {
							logger.warn(`DTO Failure:`, validationResult);
							return;
						}
					}
					const _data = _listener?.(data.data, sender);
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

		const rm2 = hookFunction("ServerAccountBeep", HookPriority.ADD_BEHAVIOR, async (args, next) => {
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
				const validationResult = await validateData(data.data, dto);
				if (dto && !validationResult.isValid) {
					logger.warn(`DTO Failure:`, validationResult);
					return next(args);
				}
				const _data = _listener?.(data.data, beep.MemberNumber, beep.MemberName);
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

		return () => {
			rm1();
			rm2();
		};
	}

	/**
	 * Registers a listener for incoming packet messages of a specific type.
	 * Supports optional DTO validation.
	 * @param message - The packet message identifier to listen for.
	 * @param dtoOrListener - Optional DTO class constructor or the listener function.
	 * @param listener - The listener function.
	 * @returns A cleanup function that removes the registered listener.
	 */
	public onPacket(
		message: string,
		listener: (data: any, sender: Character) => void,
	): () => void
	public onPacket(
		message: string,
		dto: ClassConstructor<unknown>,
		listener: (data: any, sender: Character) => void,
	): () => void
	public onPacket(
		message: string,
		dtoOrListener: ClassConstructor<unknown> | ((data: any, sender: Character) => void),
		listener?: (data: any, sender: Character) => void,
	): () => void {
		return hookFunction("ChatRoomMessage", HookPriority.ADD_BEHAVIOR, async (args, next) => {
			let _listener: ((data: any, sender: Character) => void) | undefined;
			let dto: ClassConstructor<unknown> | undefined;
			if (isClassConstructor(dtoOrListener)) {
				dto = dtoOrListener as ClassConstructor<unknown>;
				_listener = listener;
			} else {
				_listener = dtoOrListener;
			}

			const _message = args[0];
			const sender = getPlayer(_message.Sender!);
			if (!sender) return next(args);
			if (
				isZoiChatRoomMessage(_message) &&
				_message.Dictionary.msg === message &&
				!sender.IsPlayer()
			) {
				const validationResult = await validateData(_message.Dictionary.data, dto);
				if (dto && !validationResult.isValid) {
					logger.warn(`DTO Failure:`, validationResult);
					return next(args);
				}
				_listener?.(_message.Dictionary.data, sender);
			}
			return next(args);
		});
	}
}

/**
 * Manager for sending and receiving messages, packets, beeps, actions, and requests
 * between players in the chat room.
 * Supports both packet-based and beep-based communication, request-response patterns,
 * local messages, and custom actions with pronoun replacement.
 */
export const messagesManager = new MessagesManager();