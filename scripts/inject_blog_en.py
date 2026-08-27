import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MSG = ROOT / "src/messages/en.json"

posts = {
    "50-30-20-budget": {
        "title": "The 50/30/20 Budget: A Simple Plan That Actually Sticks",
        "excerpt": "A budget only works if you can keep it up. The 50/30/20 rule is popular because it is simple: split your after-tax income into needs, wants, and savings.",
        "blocks": [
            {"type": "p", "text": "Most budgets fail not because they are wrong, but because they are exhausting. The 50/30/20 rule works because it asks for awareness, not perfection. You divide your take-home pay into three buckets and adjust from there."},
            {"type": "h2", "text": "The three buckets"},
            {"type": "ul", "items": [
                "Needs (50%): rent or mortgage, groceries, utilities, insurance, minimum debt payments.",
                "Wants (30%): dining out, streaming, hobbies, travel, the things that make life feel good.",
                "Savings (20%): emergency fund, retirement, and any extra debt payments.",
            ]},
            {"type": "p", "text": "Start by calculating your after-tax income. If you are not sure what lands in your account after deductions, our [Income Tax Calculator](/finance/income-tax) can estimate your net pay first."},
            {"type": "h2", "text": "Why it works"},
            {"type": "p", "text": "The rule forces the savings habit before spending, not with whatever is left over. Even a steady 20% rate builds a real cushion surprisingly fast, and the structure makes overspending obvious the moment a bucket overflows."},
            {"type": "callout", "text": "Automate the 20% transfer on payday so saving happens before you can spend it. Out of sight is the whole point."},
            {"type": "h2", "text": "When to adjust"},
            {"type": "p", "text": "In high-cost cities the split might need to be 60/20/20 for a while, and that is fine. The point is direction, not a rigid number. Use our [Savings Goal Calculator](/finance/savings-goal) to see how your 20% compounds over time."},
        ],
    },
    "compound-interest-early": {
        "title": "Compound Interest: Why Starting Early Beats Saving More Later",
        "excerpt": "Albert Einstein supposedly called compound interest the eighth wonder of the world. Whether or not he said it, the math is real: your money earns returns, and then those returns earn returns.",
        "blocks": [
            {"type": "p", "text": "Compounding is the quiet engine behind nearly every long-term financial goal. You invest money, it grows, and the growth itself starts earning more. The longer the runway, the more dramatic the effect."},
            {"type": "h2", "text": "The snowball effect"},
            {"type": "p", "text": "Run the numbers in our [Compound Interest Calculator](/finance/compound-interest): put 200 per month at 7% for 30 years and you will see that most of the final balance came from growth, not from your contributions."},
            {"type": "h2", "text": "Time beats amount"},
            {"type": "p", "text": "Investing 100 a month from age 25 often beats investing 300 a month from age 40. The early money compounds for an extra 15 years, and those years do the heavy lifting. This is why procrastination is the most expensive habit in personal finance."},
            {"type": "callout", "text": "The single biggest factor in compounding is starting time. You cannot recover lost years, no matter how much you add later."},
            {"type": "h2", "text": "Make it automatic"},
            {"type": "p", "text": "Pair compounding with consistency using a [Savings Goal Calculator](/finance/savings-goal). Set the target, set the date, and let regular contributions do the rest."},
        ],
    },
    "bmi-body-fat-explained": {
        "title": "BMI, Body Fat, and What Your Weight Number Really Means",
        "excerpt": "Step on a scale and the number feels like a verdict. But weight alone hides more than it reveals. BMI is a starting point, not a finish line.",
        "blocks": [
            {"type": "p", "text": "We tend to treat a single weight number as the whole story. It is not. Two people can weigh the same and have completely different bodies. The useful question is not just how much you weigh, but what that weight is made of."},
            {"type": "h2", "text": "What BMI actually measures"},
            {"type": "p", "text": "Body Mass Index is weight divided by height squared. It groups you as underweight, normal, overweight, or obese. It is a cheap, fast screen, and you can find your number with the [BMI Calculator](/health/bmi)."},
            {"type": "h2", "text": "Where BMI falls short"},
            {"type": "p", "text": "Muscle weighs more than fat. A trained athlete can read as overweight while having very low body fat. That is why [Body Fat Calculator](/health/body-fat) and lean-mass estimates give a fuller picture than BMI alone."},
            {"type": "callout", "text": "Use BMI as a screen, not a diagnosis. Waist size and body composition usually tell the more honest story."},
            {"type": "h2", "text": "A healthier lens"},
            {"type": "p", "text": "Instead of fixating on the scale, combine your [BMR Calculator](/health/bmr-calculator) and [TDEE Calculator](/health/tdee-calculator) to understand your energy needs. Weight is a lagging indicator; energy balance is the thing you can actually steer."},
        ],
    },
    "extra-mortgage-payments": {
        "title": "How Extra Mortgage Payments Save You Years of Interest",
        "excerpt": "A 30-year mortgage is mostly interest in the early years. Small extra payments can shave years, and thousands of dollars, off the loan.",
        "blocks": [
            {"type": "p", "text": "The first few years of a mortgage can feel discouraging: a large payment, but the balance barely moves. That is because early payments go mostly to interest. The good news is that extra payments hit the principal hardest exactly when it matters most."},
            {"type": "h2", "text": "How amortization works"},
            {"type": "p", "text": "Amortization front-loads interest. Our [Mortgage Calculator](/finance/mortgage) shows the split between principal and interest for every month, so you can see how slowly the balance falls at first."},
            {"type": "h2", "text": "The power of a small extra amount"},
            {"type": "p", "text": "On a typical loan, an extra 100 per month can cut four to six years off the term and save tens of thousands in interest. The sooner you start, the bigger the effect."},
            {"type": "callout", "text": "Always tell your lender the extra payment should go to principal, not toward future scheduled payments."},
            {"type": "h2", "text": "Compare the trade-off"},
            {"type": "p", "text": "Before throwing everything at the mortgage, weigh it against other goals using the [ROI Calculator](/finance/roi) and [Savings Goal Calculator](/finance/savings-goal). Sometimes a higher-return investment beats paying the loan early."},
        ],
    },
    "percentages-in-everyday-life": {
        "title": "Percentages in Real Life: Discounts, Tips, and Tax Made Easy",
        "excerpt": "Percentages run the everyday math of money, from sales and tips to tax and interest. Once the pattern clicks, you can do most of it in your head.",
        "blocks": [
            {"type": "p", "text": "Percent means per hundred. Anchor every percentage problem to 100 and most of them stop being intimidating. The same idea powers discounts, tips, tax, and growth."},
            {"type": "h2", "text": "Discounts"},
            {"type": "p", "text": "A 30% discount on an 80 item saves 24, leaving 56. The shortcut is price times (1 minus the rate). Our [Discount Calculator](/math/discount) does it instantly, but the mental version is handy at the register."},
            {"type": "h2", "text": "Tips"},
            {"type": "p", "text": "An 18% tip on a 50 bill is 9. The [Tip Calculator](/math/tip) handles groups and rounding, but here is the trick: 10% is easy to find, and 20% is simply double that."},
            {"type": "h2", "text": "Tax and growth"},
            {"type": "p", "text": "The same percentage logic describes interest and inflation. See how a rate compounds over time with the [Percentage Calculator](/math/percentage-calculator)."},
            {"type": "callout", "text": "Percent literally means per hundred. Anchor every percentage problem to 100 and it gets simple fast."},
        ],
    },
    "calories-bmr-tdee": {
        "title": "Calories, BMR, and TDEE: Planning a Diet That Actually Works",
        "excerpt": "Eat less, move more is true but useless without numbers. Your calorie needs are personal, and two calculators explain why.",
        "blocks": [
            {"type": "p", "text": "Generic diet advice ignores the fact that everyone burns a different amount of energy. The fix is to estimate your own numbers first, then build a plan around them."},
            {"type": "h2", "text": "BMR: your resting burn"},
            {"type": "p", "text": "Basal Metabolic Rate is the calories you burn at complete rest, just keeping you alive. Find yours with the [BMR Calculator](/health/bmr-calculator)."},
            {"type": "h2", "text": "TDEE: your real daily need"},
            {"type": "p", "text": "Total Daily Energy Expenditure adds your activity on top of BMR. The [TDEE Calculator](/health/tdee-calculator) turns that into a daily target you can actually eat to."},
            {"type": "h2", "text": "Losing or gaining weight"},
            {"type": "p", "text": "A deficit of about 500 kcal per day is roughly one pound per week. Track your food with the [Calorie Calculator](/health/calorie-calculator) and your macros with the [Macro Calculator](/health/macro-calculator)."},
            {"type": "callout", "text": "Crash diets drop water, not fat. Aim for a modest, sustainable deficit you can keep for months."},
        ],
    },
    "cooking-unit-conversions": {
        "title": "Cooking Unit Conversions: Cups, Grams, and Ounces Without the Guesswork",
        "excerpt": "A recipe calls for 200 g of flour but your cups are imperial. Converting cooking units should not ruin dinner.",
        "blocks": [
            {"type": "p", "text": "Cooking across recipes from different countries means juggling cups, grams, ounces, and milliliters. The reliable move is to stop measuring by volume and start measuring by weight."},
            {"type": "h2", "text": "Weight beats volume"},
            {"type": "p", "text": "A cup of flour can vary by 20% depending on how you scoop it. Our [Cooking Units Converter](/cooking/cooking-units) handles cups, grams, ounces, and milliliters so your results stay consistent."},
            {"type": "h2", "text": "Scaling recipes"},
            {"type": "p", "text": "Doubling a recipe by hand is error-prone. The [Recipe Scaler](/cooking/recipe-scaler) adjusts every ingredient automatically, and the [Food Cost Calculator](/cooking/food-cost) prices it out if you are cooking for a crowd."},
            {"type": "callout", "text": "Flour and sugar are not interchangeable by volume. Always convert by weight when you bake."},
            {"type": "h2", "text": "Beyond the kitchen"},
            {"type": "p", "text": "For general measurements, the [Unit Converter](/math/unit-converter) covers length, temperature, and more when a recipe strays into non-cooking territory."},
        ],
    },
    "debt-snowball-vs-avalanche": {
        "title": "Debt Snowball vs. Avalanche: Which Payoff Method Wins?",
        "excerpt": "Two popular methods promise to crush debt. They differ on one question: do you pay by emotion, or by math?",
        "blocks": [
            {"type": "p", "text": "If you carry several debts, the order you pay them off matters as much as the amount. The two best-known strategies attack that order very differently."},
            {"type": "h2", "text": "Snowball: motivation first"},
            {"type": "p", "text": "List debts smallest balance to largest. Pay the minimum on all, then throw every extra dollar at the smallest. Quick wins build momentum. Model the whole thing in our [Debt Snowball and Avalanche Calculator](/finance/debt-snowball-avalanche)."},
            {"type": "h2", "text": "Avalanche: math first"},
            {"type": "p", "text": "Pay the highest interest rate first. You save the most money and finish fastest, but the early progress can feel slow because big balances linger."},
            {"type": "callout", "text": "Mathematically, avalanche wins. Behaviorally, snowball often sticks. Pick the one you will actually finish."},
            {"type": "h2", "text": "Do not forget the rate"},
            {"type": "p", "text": "Before choosing, compare the cost of your debt to what you might earn investing with the [ROI Calculator](/finance/roi). Sometimes it pays to invest while making minimum payments."},
        ],
    },
}


def main():
    data = json.loads(MSG.read_text(encoding="utf-8"))
    data.setdefault("blog", {})
    data["blog"]["posts"] = posts
    MSG.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Injected {len(posts)} posts into {MSG}")


if __name__ == "__main__":
    main()
