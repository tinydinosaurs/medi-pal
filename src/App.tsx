import React, { useState, useRef, useEffect } from 'react';
import {
	Calendar,
	Pill,
	FileText,
	Users,
	Upload,
	MessageSquare,
	AlertCircle,
	CheckCircle,
	ChevronRight,
	// X,
	Loader2,
	Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Types
interface Medication {
	id: number;
	name: string;
	dosage: string;
	schedule: string;
	purpose: string;
	taken: boolean;
}

interface Appointment {
	id: number;
	doctor: string;
	specialty: string;
	date: string;
	time: string;
	prepared: boolean;
}

interface Document {
	id: number;
	type: string;
	date: string;
	name: string;
	reviewed: boolean;
}

interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

interface FamilyActivity {
	id: number;
	member: string;
	action: string;
	time: string;
}

// Mock data
const MOCK_MEDICATIONS: Medication[] = [
	{
		id: 1,
		name: 'Lisinopril',
		dosage: '10mg',
		schedule: '8:00 AM',
		purpose: 'Blood pressure',
		taken: true,
	},
	{
		id: 2,
		name: 'Metformin',
		dosage: '500mg',
		schedule: '8:00 AM',
		purpose: 'Diabetes',
		taken: true,
	},
	{
		id: 3,
		name: 'Atorvastatin',
		dosage: '20mg',
		schedule: '8:00 PM',
		purpose: 'Cholesterol',
		taken: false,
	},
	{
		id: 4,
		name: 'Aspirin',
		dosage: '81mg',
		schedule: '8:00 AM',
		purpose: 'Heart health',
		taken: true,
	},
	{
		id: 5,
		name: 'Levothyroxine',
		dosage: '50mcg',
		schedule: '8:00 AM',
		purpose: 'Thyroid',
		taken: true,
	},
];

const MOCK_APPOINTMENTS: Appointment[] = [
	{
		id: 1,
		doctor: 'Dr. Chen',
		specialty: 'Cardiology',
		date: '2026-01-13',
		time: '2:00 PM',
		prepared: false,
	},
	{
		id: 2,
		doctor: 'Dr. Patel',
		specialty: 'Primary Care',
		date: '2026-01-20',
		time: '10:30 AM',
		prepared: false,
	},
	{
		id: 3,
		doctor: 'Dr. Morrison',
		specialty: 'Endocrinology',
		date: '2026-01-27',
		time: '3:15 PM',
		prepared: false,
	},
];

const MOCK_DOCUMENTS: Document[] = [
	{
		id: 1,
		type: 'Lab Results',
		date: '2026-01-06',
		name: 'CBC Panel',
		reviewed: false,
	},
	{
		id: 2,
		type: 'Bill',
		date: '2026-01-05',
		name: "St. Mary's Hospital",
		reviewed: false,
	},
];

const MOCK_FAMILY_ACTIVITY: FamilyActivity[] = [
	{
		id: 1,
		member: 'Sarah',
		action: 'Reviewed hospital bill - flagged duplicate charge',
		time: '2 hours ago',
	},
	{
		id: 2,
		member: 'David',
		action: 'Added appointment notes from Dr. Chen visit',
		time: 'Yesterday, 3:45 PM',
	},
];

const SAMPLE_DOCUMENTS_INFO = [
	{
		name: 'Lab Results (CBC Panel)',
		description: 'Complete blood count with some values out of range',
	},
	{
		name: 'Medical Bill',
		description:
			'Hospital bill with duplicate charges and insurance errors',
	},
	{
		name: 'Appointment Summary',
		description: 'Doctor visit notes with medication changes',
	},
];

function App() {
	const [view, setView] = useState<'patient' | 'caregiver'>('patient');
	const [showChat, setShowChat] = useState(false);
	const [showUpload, setShowUpload] = useState(false);
	const [medications, setMedications] =
		useState<Medication[]>(MOCK_MEDICATIONS);
	const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
		{
			role: 'assistant',
			content:
				"Hi! I'm your Caretaker assistant. I can help you understand your medications, lab results, bills, and appointments. What would you like to know?",
		},
	]);
	const [inputMessage, setInputMessage] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const chatEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [chatMessages]);

	const toggleMedication = (id: number) => {
		setMedications((meds) =>
			meds.map((med) =>
				med.id === id ? { ...med, taken: !med.taken } : med
			)
		);
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsProcessing(true);
		setShowUpload(false);
		setShowChat(true);

		setChatMessages((prev) => [
			...prev,
			{
				role: 'user',
				content: `Uploaded: ${file.name}`,
			},
		]);

		setChatMessages((prev) => [
			...prev,
			{
				role: 'assistant',
				content: '📄 Processing document...',
			},
		]);

		try {
			let response;
			const fileName = file.name.toLowerCase();

			if (
				fileName.includes('lab') ||
				fileName.includes('blood') ||
				fileName.includes('cbc')
			) {
				response = await processLabResults();
			} else if (
				fileName.includes('bill') ||
				fileName.includes('invoice')
			) {
				response = await processBill();
			} else if (
				fileName.includes('appointment') ||
				fileName.includes('visit')
			) {
				response = await processAppointment();
			} else {
				response = await processGenericDocument(file);
			}

			setDocuments((prev) => [
				{
					id: prev.length + 1,
					type: response.type,
					date: new Date().toISOString().split('T')[0],
					name: file.name,
					reviewed: true,
				},
				...prev,
			]);

			setChatMessages((prev) => {
				const newMessages = [...prev];
				newMessages[newMessages.length - 1] = {
					role: 'assistant',
					content: response.message,
				};
				return newMessages;
			});
		} catch (error) {
			console.log('Error processing document:', error);
			setChatMessages((prev) => {
				const newMessages = [...prev];
				newMessages[newMessages.length - 1] = {
					role: 'assistant',
					content:
						'I encountered an error processing that document. Please try again or ask me a question about your existing medical information.',
				};
				return newMessages;
			});
		} finally {
			setIsProcessing(false);
		}
	};

	const processLabResults = async () => {
		return {
			type: 'Lab Results',
			message: `✅ **Lab Results Processed**

I've reviewed your Complete Blood Count (CBC) panel from January 6th. Here's what you need to know:

**🟢 Normal Results:**
- Red Blood Cells: 4.8 (normal range: 4.5-5.5)
- Hemoglobin: 14.2 (normal range: 13.5-17.5)
- Platelets: 225,000 (normal range: 150,000-400,000)

**🟡 Slightly Elevated:**
- White Blood Cells: 12.5 (normal range: 4-11)

**What this means:** Your white blood cell count is slightly elevated, which could indicate your body is fighting an infection or inflammation. This is common with recent colds or minor infections.

**Recommended action:** Discuss this with Dr. Chen at your upcoming appointment on January 13th. I've added this to your appointment prep questions.

Would you like me to explain any of these values in more detail?`,
		};
	};

	const processBill = async () => {
		return {
			type: 'Bill',
			message: `⚠️ **Medical Bill Analyzed**

I've reviewed your bill from St. Mary's Hospital dated January 5th.

**Total Billed:** $3,847.00
**Insurance Paid:** $2,955.00
**Your Responsibility:** $892.00

**🚨 Issues Found:**

**1. DUPLICATE CHARGE (High Confidence)**
- Line 7: "CBC Blood Panel" - $145.00
- Line 23: "Complete Blood Count" - $145.00
→ These are the same test with different names
→ **Potential savings: $145.00**

**2. INSURANCE PROCESSING ERROR**
- Line 12: "Cardiology Consultation" charged as out-of-network ($450)
- Dr. Chen IS in your insurance network
→ Should be covered at in-network rate
→ **Potential savings: $180.00**

**Estimated overcharge: $325.00**

**Recommended actions:**
1. Call St. Mary's billing: (555) 0199
2. Reference invoice #84729
3. Mention the duplicate CBC charge
4. Request insurance reprocessing for Dr. Chen's consultation

Would you like me to draft a letter to the billing department?`,
		};
	};

	const processAppointment = async () => {
		return {
			type: 'Appointment Summary',
			message: `📋 **Appointment Summary Processed**

I've reviewed your visit notes from Dr. Chen (Cardiology) on January 3rd.

**Key Updates:**
- **New Medication:** Started Atorvastatin 20mg for cholesterol management
- **Medication Adjustment:** Lisinopril increased from 5mg to 10mg
- **Follow-up Required:** Blood pressure check in 2 weeks

**Important Notes:**
- Dr. Chen mentioned possible dizziness with the increased Lisinopril dose
- Take new cholesterol medication in the evening with dinner
- Schedule follow-up appointment for late January

**⚠️ Action Items:**
1. I've updated your medication list with the new prescriptions
2. Added reminder to monitor for dizziness
3. Need to schedule follow-up appointment

**Questions for next visit:**
- How long before we see cholesterol improvement?
- What side effects should we watch for?

Would you like me to help schedule that follow-up appointment?`,
		};
	};

	const processGenericDocument = async (file: File) => {
		return {
			type: 'Document',
			message: `📄 **Document Received**

I've received "${file.name}". To give you the best analysis, could you tell me what type of document this is?

- Lab results or test results
- Medical bill or invoice  
- Appointment summary or doctor's notes
- Prescription information
- Insurance documents

Or just ask me a specific question about the document!`,
		};
	};

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || isProcessing) return;

		const userMessage = inputMessage.trim();
		setInputMessage('');
		setChatMessages((prev) => [
			...prev,
			{ role: 'user', content: userMessage },
		]);
		setIsProcessing(true);

		try {
			const response = await fetch(
				'https://api.anthropic.com/v1/messages',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: 'claude-sonnet-4-20250514',
						max_tokens: 1024,
						messages: [
							{
								role: 'user',
								content: `You are a helpful medical care assistant called "Caretaker". Your job is to help patients and their families organize medical information, understand test results, review bills for errors, and prepare for appointments.

CRITICAL RULES:
- NEVER provide medical diagnoses or treatment advice
- NEVER tell someone to start, stop, or change medications
- Always suggest consulting their doctor for medical decisions
- Focus on explaining, organizing, and coordinating information
- Be warm, supportive, and reduce stress
- If asked for medical advice, gently redirect: "I can help you understand the information, but medical decisions should be made with your doctor."

Current patient context:
Medications: Lisinopril 10mg, Metformin 500mg, Atorvastatin 20mg, Aspirin 81mg, Levothyroxine 50mcg
Recent documents: CBC lab results (WBC slightly elevated), Hospital bill with potential errors
Upcoming appointments: Dr. Chen (Cardiology) on Jan 13

User question: ${userMessage}

Provide a helpful, clear response that organizes information and reduces confusion, but avoids giving medical advice.`,
							},
						],
					}),
				}
			);

			const data = await response.json();
			const assistantMessage = data.content
				.filter(
					(block: { type: string; text?: string }) =>
						block.type === 'text'
				)
				.map((block: { type: string; text: string }) => block.text)
				.join('\n');

			setChatMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content:
						assistantMessage ||
						'I apologize, but I had trouble processing that. Could you rephrase your question?',
				},
			]);
		} catch (error) {
			console.log('Error communicating with AI API:', error);
			setChatMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content:
						"I'm having trouble connecting right now. In the meantime, I can help with questions about your medications, appointments, or the documents you've uploaded.",
				},
			]);
		} finally {
			setIsProcessing(false);
		}
	};

	const adherenceRate = Math.round(
		(medications.filter((m) => m.taken).length / medications.length) * 100
	);

	return (
		<div className="min-h-screenbg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100 sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
								<Pill className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
									Caretaker
								</h1>
								<p className="text-sm text-slate-600">
									Medical Care Assistant
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								onClick={() => setView('patient')}
								variant={
									view === 'patient' ? 'default' : 'outline'
								}
								className={
									view === 'patient'
										? 'bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
										: ''
								}
							>
								Patient View
							</Button>
							<Button
								onClick={() => setView('caregiver')}
								variant={
									view === 'caregiver' ? 'default' : 'outline'
								}
								className={
									view === 'caregiver'
										? 'bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
										: ''
								}
							>
								<Users className="w-4 h-4 mr-2" />
								Family View
							</Button>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Banner */}
				<Card className="mb-6 border-emerald-200 shadow-lg">
					<CardContent className="pt-6">
						<h2 className="text-xl font-semibold text-slate-900 mb-2">
							Good Morning, Marie! 👋
						</h2>
						<p className="text-slate-600">
							Friday, January 14, 2026
						</p>
					</CardContent>
				</Card>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column */}
					<div className="lg:col-span-2 space-y-6">
						{/* Today's Medications */}
						<Card className="border-emerald-200 shadow-lg">
							<CardHeader>
								<div className="flex justify-between items-center">
									<CardTitle className="flex items-center gap-2">
										<Pill className="w-5 h-5 text-emerald-600" />
										Today's Medications
									</CardTitle>
									<Badge
										variant="secondary"
										className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
									>
										{adherenceRate}% complete
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{medications.map((med) => (
									<div
										key={med.id}
										className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
											med.taken
												? 'border-emerald-300 bg-linear-to-br from-emerald-50 to-teal-50'
												: 'border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md'
										}`}
									>
										<Checkbox
											checked={med.taken}
											onCheckedChange={() =>
												toggleMedication(med.id)
											}
											className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
										/>
										<div className="flex-1">
											<p className="font-semibold text-slate-900">
												{med.name}{' '}
												<span className="text-slate-600 font-medium">
													{med.dosage}
												</span>
											</p>
											<p className="text-sm text-slate-600">
												{med.purpose} • {med.schedule}
											</p>
										</div>
										{med.taken && (
											<CheckCircle className="w-5 h-5 text-emerald-600" />
										)}
									</div>
								))}
							</CardContent>
						</Card>

						{/* Upcoming Appointments */}
						<Card className="border-emerald-200 shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="w-5 h-5 text-emerald-600" />
									Upcoming Appointments
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{MOCK_APPOINTMENTS.map((apt) => (
									<div
										key={apt.id}
										className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer hover:shadow-md"
									>
										<div>
											<p className="font-semibold text-slate-900">
												{apt.doctor}
											</p>
											<p className="text-sm text-slate-600">
												{apt.specialty}
											</p>
											<p className="text-sm text-slate-500 mt-1">
												{new Date(
													apt.date
												).toLocaleDateString('en-US', {
													weekday: 'short',
													month: 'short',
													day: 'numeric',
												})}{' '}
												at {apt.time}
											</p>
										</div>
										<ChevronRight className="w-5 h-5 text-slate-400" />
									</div>
								))}
							</CardContent>
						</Card>

						{/* Recent Documents */}
						<Card className="border-emerald-200 shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="w-5 h-5 text-emerald-600" />
									Recent Documents
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{documents.map((doc) => (
									<div
										key={doc.id}
										className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer hover:shadow-md"
									>
										<div className="flex items-center gap-3">
											<FileText className="w-5 h-5 text-slate-400" />
											<div>
												<p className="font-semibold text-slate-900">
													{doc.name}
												</p>
												<p className="text-sm text-slate-600">
													{doc.type} • {doc.date}
												</p>
											</div>
										</div>
										{!doc.reviewed && (
											<Badge
												variant="secondary"
												className="bg-amber-100 text-amber-700 hover:bg-amber-100"
											>
												New
											</Badge>
										)}
									</div>
								))}
							</CardContent>
						</Card>
					</div>

					{/* Right Column */}
					<div className="space-y-6">
						{/* Quick Actions */}
						<Card className="border-emerald-200 shadow-lg">
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Button
									onClick={() => {
										setShowUpload(true);
										setShowChat(false);
									}}
									className="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
								>
									<Upload className="w-4 h-4 mr-2" />
									Upload Document
								</Button>
								<Button
									onClick={() => {
										setShowChat(true);
										setShowUpload(false);
									}}
									className="w-full"
									variant="outline"
								>
									<MessageSquare className="w-4 h-4 mr-2" />
									Ask Caretaker
								</Button>
							</CardContent>
						</Card>

						{/* Alerts */}
						<Card className="border-amber-200 shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-amber-700">
									<AlertCircle className="w-5 h-5" />
									Needs Attention
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-200">
									<p className="text-sm font-semibold text-amber-900">
										Prescription Refill Due
									</p>
									<p className="text-sm text-amber-700 mt-1">
										Lisinopril refill needed in 3 days
									</p>
								</div>
								<div className="p-3 rounded-xl bg-blue-50 border-2 border-blue-200">
									<p className="text-sm font-semibold text-blue-900">
										Appointment Prep
									</p>
									<p className="text-sm text-blue-700 mt-1">
										Dr. Chen visit on Monday - prep
										checklist available
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Family Activity */}
						{view === 'caregiver' && (
							<Card className="border-emerald-200 shadow-lg">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Users className="w-5 h-5 text-emerald-600" />
										Family Activity
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{MOCK_FAMILY_ACTIVITY.map((activity) => (
										<div
											key={activity.id}
											className="p-3 rounded-xl bg-slate-50 border border-slate-200"
										>
											<p className="text-sm font-semibold text-slate-900">
												{activity.member}
											</p>
											<p className="text-sm text-slate-600 mt-1">
												{activity.action}
											</p>
											<p className="text-xs text-slate-500 mt-1">
												{activity.time}
											</p>
										</div>
									))}
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</main>

			{/* Upload Dialog */}
			<Dialog open={showUpload} onOpenChange={setShowUpload}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Upload Document</DialogTitle>
						<DialogDescription>
							Upload lab results, bills, or appointment summaries
							for AI analysis
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
							<Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
							<p className="text-lg font-medium text-slate-900 mb-2">
								Drop your document here, or click to browse
							</p>
							<p className="text-sm text-slate-600 mb-4">
								Supports PDF, images (JPG, PNG)
							</p>
							<input
								ref={fileInputRef}
								type="file"
								accept=".pdf,image/*"
								onChange={handleFileUpload}
								className="hidden"
							/>
							<Button
								onClick={() => fileInputRef.current?.click()}
								className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
							>
								Choose File
							</Button>
						</div>

						<div>
							<h3 className="font-semibold text-slate-900 mb-3">
								Try these sample documents:
							</h3>
							<div className="space-y-2">
								{SAMPLE_DOCUMENTS_INFO.map((sample, idx) => (
									<div
										key={idx}
										className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
									>
										<p className="font-medium text-slate-900 text-sm">
											{sample.name}
										</p>
										<p className="text-xs text-slate-600 mt-1">
											{sample.description}
										</p>
									</div>
								))}
							</div>
							<p className="text-xs text-slate-500 mt-3">
								Note: For this demo, upload any medical document
								and I'll show you how the AI processes it!
							</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Chat Dialog */}
			<Dialog open={showChat} onOpenChange={setShowChat}>
				<DialogContent className="max-w-3xl h-150 flex flex-col p-0">
					<DialogHeader className="px-6 pt-6 pb-4 border-b">
						<DialogTitle className="flex items-center gap-2">
							<MessageSquare className="w-6 h-6 text-emerald-600" />
							Chat with Caretaker
						</DialogTitle>
					</DialogHeader>

					<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
						{chatMessages.map((msg, idx) => (
							<div
								key={idx}
								className={`flex ${
									msg.role === 'user'
										? 'justify-end'
										: 'justify-start'
								}`}
							>
								<div
									className={`max-w-[80%] rounded-xl p-4 ${
										msg.role === 'user'
											? 'bg-linear-to-r from-emerald-500 to-teal-600 text-white'
											: 'bg-slate-100 text-slate-900'
									}`}
								>
									<p className="text-sm whitespace-pre-wrap">
										{msg.content}
									</p>
								</div>
							</div>
						))}
						{isProcessing && (
							<div className="flex justify-start">
								<div className="bg-slate-100 rounded-xl p-4">
									<Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
								</div>
							</div>
						)}
						<div ref={chatEndRef} />
					</div>

					<div className="px-6 py-4 border-t">
						<div className="flex gap-2">
							<Input
								type="text"
								value={inputMessage}
								onChange={(e) =>
									setInputMessage(e.target.value)
								}
								onKeyPress={(e) =>
									e.key === 'Enter' && handleSendMessage()
								}
								placeholder="Ask about medications, appointments, or documents..."
								disabled={isProcessing}
								className="flex-1"
							/>
							<Button
								onClick={handleSendMessage}
								disabled={isProcessing || !inputMessage.trim()}
								className="bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
							>
								<Send className="w-4 h-4" />
							</Button>
						</div>
						<p className="text-xs text-slate-500 mt-2">
							Try asking: "What medications might cause
							dizziness?" or "Explain my lab results"
						</p>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default App;
