use clap::Parser;
use std::collections::HashSet;
use std::collections::HashMap;
use plotters::prelude::*;

#[derive(Parser)]
struct Cli {
    array_length: usize,
}

fn main() {
    let cli = Cli::parse();
    let num = cli.array_length;
    if num < 3 || num > 20 {
        println!("The array length should be between 3 and 20");
        return;
    }

    let mut available = HashSet::new();
    let mut histogram_sum = 0;
    for x in 0..num {
        available.insert(x);
        histogram_sum += x;
    }

    let mut histogram = HashMap::new();
    for x in 0..=histogram_sum {
        histogram.insert(x, 0);
    }

    let mut stack = Vec::new();
    for value in &available {
        stack.push(*value);
        let mut new_available = available.clone();
        new_available.remove(&value);
        generate_permutations(&mut stack, new_available, num, &mut histogram);
        stack.pop();
    }

    draw_histogram(histogram, num);
}

fn draw_histogram(histogram: HashMap<usize, usize>, num: usize) {
    println!("histogram: {:?}", histogram);

    let mut max_frequency = 0;
    for (_, frequency) in &histogram {
        if frequency > &max_frequency {
            max_frequency = *frequency;
        }
    }

    let file_location = format!("histogram-{num}.png");
    // println!("{}", file_location);
    let root_area = BitMapBackend::new(&file_location, (600, 400))
        .into_drawing_area();
    root_area.fill(&WHITE).unwrap();

    let chart_title = format!("K Inverse Pairs Distribution ({num})");
    let histogram_length = histogram.len() - 1;
    let mut ctx = ChartBuilder::on(&root_area)
        .caption(chart_title, ("sans-serif", 40))
        .build_cartesian_2d((0..histogram_length).into_segmented(), 0..max_frequency)
        .unwrap();

    ctx.draw_series(histogram.into_iter().map(|(x, y)| {
            let x0 = SegmentValue::Exact(x);
            let x1 = SegmentValue::Exact(x + 1);
            let mut bar = Rectangle::new([(x0, 0), (x1, y)], BLUE.filled());
            bar.set_margin(0, 0, 0, 0);
            bar
        }))
        .unwrap();
}

fn generate_permutations(mut stack: &mut Vec<usize>, available: HashSet<usize>, num: usize, mut histogram: &mut HashMap<usize, usize>) -> () {
    if stack.len() == num {
        // println!("stack: {:?}", stack);
        let inverse_pairs = count_inverse_pairs(stack);
        let inverse_pairs_frequency = histogram.get(&inverse_pairs).unwrap();
        histogram.insert(inverse_pairs, inverse_pairs_frequency + 1);
        return;
    }
    
    for value in &available {
        stack.push(*value);
        let mut new_available = available.clone();
        new_available.remove(&value);
        generate_permutations(&mut stack, new_available, num, &mut histogram);
        stack.pop();
    }
}

fn count_inverse_pairs(stack: &mut Vec<usize>) -> usize {
    let mut count = 0;
    for i in 0..(stack.len() - 1) {
        for j in i..stack.len() {
            if stack[i] > stack[j] {
                count += 1;
            }
        }
    }
    return count;
}
