import json, random, os
from datetime import datetime, timedelta

random.seed(42)
names = ['Gaurav Kumar','Abhay Kumar','Atul Gupta','John Doe','Priya Sharma','Rahul Singh','Anita Patel','Vikram Mehta','Sneha Reddy','Arjun Nair']
countries = ['Australia','Canada','UK','Singapore','Hungary']
courses = ['MBA','MCOM','pg','Computer Science','PHD']
branches = ['Head Office','Delhi']
sources = ['Walking','Facebook','Registration Form','SMS','Marketing']

def ts():
    d = datetime(2026,1,1) + timedelta(days=random.randint(0,160), hours=random.randint(0,23))
    return d.isoformat() + 'Z'

enquiries = []
for i in range(20):
    n = names[i % len(names)]
    enquiries.append({
        'id': f'e{i+1}', 'firstName': n.split()[0], 'lastName': n.split()[-1] if ' ' in n else '',
        'email': f"{n.split()[0].lower()}@email.com", 'mobile': f'+91 98{random.randint(10000000,99999999)}',
        'interestedCourse': random.choice(courses), 'interestedCountry': random.choice(countries),
        'intake': random.choice(['Sep-2026','Apr-2026','Nov-2026','Jan-2026']), 'applyLevel': 'Post Graduation',
        'source': random.choice(sources), 'status': random.choice(['New Enquiry','Follow-up Required','Counselling Scheduled','Interested']),
        'branch': random.choice(branches), 'assignedBy': 'Krs Infotech (Operational Head)',
        'assignedTo': random.choice(['Counsellor A','Calling Team']),
        'partnerId': 'p1' if i % 3 == 0 else None, 'partnerName': 'Falendra Sharma' if i % 3 == 0 else None,
        'createdAt': ts(), 'updatedAt': ts()
    })

students = []
for i in range(20):
    n = names[i % len(names)]
    students.append({
        'id': f's{i+1}', 'studentId': f'KRS/S/26/{str(500+i).zfill(5)}',
        'firstName': n.split()[0], 'lastName': n.split()[-1] if ' ' in n else '',
        'email': f"{n.split()[0].lower()}@email.com", 'mobile': f'+91 98{random.randint(10000000,99999999)}',
        'interestedCourse': random.choice(courses), 'interestedCountry': random.choice(countries),
        'intake': random.choice(['Sep-2026','Nov-2026','Jan-2026']), 'applyLevel': random.choice(['Post Graduation','PHD']),
        'source': random.choice(sources), 'status': random.choice(['New Student','Documents Pending','On Hold']),
        'docStatus': random.choice(['Pending','Completed']), 'passportNo': f'P{random.randint(1000000,9999999)}',
        'branch': random.choice(branches), 'assignedBy': 'Operational Head', 'assignedTo': 'Counsellor A',
        'partnerId': 'p1' if i % 4 == 0 else None, 'partnerName': 'Falendra Sharma' if i % 4 == 0 else None,
        'createdAt': ts(), 'updatedAt': ts()
    })

applications = []
for i in range(25):
    s = students[i % 20]
    applications.append({
        'id': f'a{i+1}', 'studentId': s['id'], 'studentRef': s['studentId'],
        'studentName': f"{s['firstName']} {s['lastName']}", 'email': s['email'], 'mobile': s['mobile'],
        'applicationCount': random.randint(1,3), 'docStatus': random.choice(['Pending','Completed']),
        'intCountry': random.choice(countries), 'intake': s['intake'], 'intCourse': random.choice(courses),
        'applyLevel': s['applyLevel'], 'passportNo': s['passportNo'], 'dateOfBirth': '1998-05-15',
        'branch': s['branch'], 'partnerId': s.get('partnerId'), 'partnerName': s.get('partnerName'),
        'status': random.choice(['Application Submitted','Application Under Review','Finalized','Offer Received']),
        'university': random.choice(['UNSW Global','University of Victoria','Leeds College']),
        'isPartner': bool(s.get('partnerId')), 'assignedBy': 'Operational Head', 'assignedTo': 'Counselling',
        'createdAt': ts(), 'updatedAt': ts()
    })

visas = []
for i in range(15):
    s = students[i % 15]
    visas.append({
        'id': f'v{i+1}', 'studentId': s['id'], 'studentRef': s['studentId'],
        'studentName': f"{s['firstName']} {s['lastName']}", 'email': s['email'], 'mobile': s['mobile'],
        'docStatus': random.choice(['Pending','Completed']), 'appliedCountry': random.choice(countries),
        'university': random.choice(['UNSW Global','University of Victoria']),
        'visaStatus': random.choice(['Visa Application In Progress','Visa Granted','Pending']),
        'course': random.choice(courses), 'intake': s['intake'], 'passportNo': s['passportNo'],
        'branch': s['branch'], 'partnerId': s.get('partnerId'), 'partnerName': s.get('partnerName'),
        'isPartner': bool(s.get('partnerId')), 'assignedBy': 'Operational Head', 'assignedTo': 'Visa Team',
        'createdAt': ts(), 'updatedAt': ts()
    })

defers = [
    {'id':'d1','studentId':'s5','studentRef':'KRS/S/24/00531','studentName':'Atul Gupta','email':'atul@email.com','mobile':'+91 9812345678','deferIntake':'Jun-2024','deferReason':'due to family issue','interestedCountries':'Canada, Australia','branch':'Head Office','assignedBy':'Krs Infotech (Operational Head)','assignedTo':'Counsellor A','isPartner':False,'createdAt':ts(),'updatedAt':ts()},
    {'id':'d2','studentId':'s8','studentRef':'KRS/S/24/00532','studentName':'Priya Sharma','email':'priya@email.com','mobile':'+91 9823456789','deferIntake':'Dec-2024','deferReason':'financial constraints','interestedCountries':'Australia','branch':'Delhi','assignedBy':'Operational Head','assignedTo':'Counsellor B','isPartner':True,'partnerId':'p1','partnerName':'Falendra Sharma','createdAt':ts(),'updatedAt':ts()},
    {'id':'d3','studentId':'s12','studentRef':'KRS/S/24/00533','studentName':'Rahul Singh','email':'rahul@email.com','mobile':'+91 9834567890','deferIntake':'Jun-2024','deferReason':'visa delay','interestedCountries':'Canada','branch':'Head Office','assignedBy':'Operational Head','assignedTo':'Visa Team','isPartner':False,'createdAt':ts(),'updatedAt':ts()},
]

enrolled = [
    {'id':'en1','studentId':'s1','studentRef':'KRS/S/26/00548','studentName':'Gaurav Kumar','email':'gaurav@email.com','mobile':'+91 9845678901','appliedCountry':'Australia','appliedUniversity':'UNSW Global','course':'MBA','intake':'Sep-2026','status':'Enrolled','source':'Facebook','branch':'Head Office','assignedBy':'Operational Head','assignedTo':'Counsellor A','isPartner':False,'createdAt':ts(),'updatedAt':ts()},
    {'id':'en2','studentId':'s3','studentRef':'KRS/S/26/00550','studentName':'Atul Gupta','email':'atul@email.com','mobile':'+91 9856789012','appliedCountry':'Canada','appliedUniversity':'University of Victoria','course':'MBA','intake':'Dec-2026','status':'Enrolled','source':'SMS','branch':'Head Office','partnerId':'p1','partnerName':'Falendra Sharma','isPartner':True,'assignedBy':'Operational Head','assignedTo':'Counsellor A','createdAt':ts(),'updatedAt':ts()},
]

invoices = []
for i in range(15):
    total = random.randint(10000, 50000)
    paid = random.choice([0, total // 2, total])
    pending = total - paid
    status = 'Fully Paid' if pending == 0 else ('Partial Paid' if paid > 0 else 'Pending')
    s = students[i % 15]
    invoices.append({
        'id': f'inv{i+1}', 'invoiceId': f"{s['studentId']}-{i+1}", 'studentId': s['id'],
        'name': f"{s['firstName']} {s['lastName']}", 'email': s['email'], 'mobile': s['mobile'],
        'totalAmount': total, 'discount': 0, 'afterDiscount': total, 'taxPercent': 18, 'taxType': 'Include Tax',
        'taxAmount': int(total * 0.18), 'grandTotal': int(total * 1.18), 'paidAmount': paid,
        'pendingAmount': int(pending * 1.18) if pending else 0, 'dueDate': '2026-07-01',
        'status': status, 'serviceType': random.choice(['Admission','Visa Fees','Application Process Fee']),
        'currency': 'INR', 'createdBy': 'Krs Infotech (Operational Head)',
        'partnerId': s.get('partnerId'), 'createdAt': ts(), 'updatedAt': ts()
    })

partner_invoices = [
    {'id':'pi1','invoiceNo':'KRS/S/24/005','studentCount':3,'netCommission':5000,'currency':'GBP','taxPercent':18,'taxAmount':900,'totalCommission':5900,'receivedCommission':3000,'pendingCommission':2900,'status':'Partial Paid','createdBy':'KRS INFOTECH (Falendra Sharma)','partnerId':'p1','createdAt':ts(),'updatedAt':ts()},
    {'id':'pi2','invoiceNo':'KRS/S/24/006','studentCount':2,'netCommission':3500,'currency':'INR','taxPercent':18,'taxAmount':630,'totalCommission':4130,'receivedCommission':0,'pendingCommission':4130,'status':'Pending','createdBy':'KRS INFOTECH (Falendra Sharma)','partnerId':'p1','createdAt':ts(),'updatedAt':ts()},
]

uni_comm = [
    {'id':'uc1','invoiceNo':'KRS/2024/001','country':'Canada','university':'University of Victoria','studentCount':2,'totalCommission':18526,'receivedCommission':1378,'pendingCommission':17148,'status':'Partial Paid','createdBy':'Krs Infotech (Operational Head)','commissionType':'Uni. Flat Comm.','commissionSubType':'Percentage','createdAt':ts(),'updatedAt':ts()},
]

events = []
for i in range(30):
    cat, et = random.choice([('enquiry','followup'),('enquiry','appointment'),('student','followup'),('application','appointment'),('visa','followup'),('invoice','due')])
    d = datetime(2026, 6, 1) + timedelta(days=random.randint(0, 30))
    events.append({'id': f'ev{i}', 'title': random.choice(names), 'start': d.isoformat(), 'category': cat, 'eventType': et, 'branch': 'Head Office', 'staffId': '1'})

universities = [{'country': c, 'count': random.randint(1, 127)} for c in ['Australia','Austria','Belgium','Canada','Cyprus','Denmark','Dubai','Finland','France','Germany']]

base = os.path.join(os.path.dirname(__file__), '..', 'src', 'mocks', 'data')
os.makedirs(base, exist_ok=True)
for name, data in [
    ('enquiries', enquiries), ('students', students), ('applications', applications),
    ('visas', visas), ('defers', defers), ('enrolled', enrolled), ('invoices', invoices),
    ('partner-invoices', partner_invoices), ('university-commission', uni_comm),
    ('calendar-events', events), ('universities', universities),
]:
    with open(os.path.join(base, name + '.json'), 'w') as f:
        json.dump(data, f, indent=2)
print('Mock data generated')
